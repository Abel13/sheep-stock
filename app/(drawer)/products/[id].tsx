import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AWS from 'aws-sdk';
import { supabase } from '@/services/supabaseClient';
import { Product } from '@/types/Product';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Switch,
  Image,
  useTheme,
  View,
} from 'tamagui';
import { useToastController } from '@tamagui/toast';
import { CurrencyFormField } from '@/components/molecules/FormField/CurrencyFormField';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { formatCurrency } from '@/utils/currency';
import { DeleteObjectRequest } from 'aws-sdk/clients/s3';
import { Loading } from '@/components/molecules/Loading';

interface UpdateProduct {
  sale_price: number;
}

const productSchema = yup.object().shape({
  sale_price: yup
    .number()
    .required('Sale price is required')
    .min(0, 'Sale price must be positive'),
});

// Configuração do S3
AWS.config.update({
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_KEY,
  region: process.env.EXPO_PUBLIC_AWS_REGION,
});

const s3 = new AWS.S3();

const fetchProductById = async (productId: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('product_code', productId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const fetchAveragePrice = async (productId: string) => {
  const { data, error } = await supabase.rpc('calculate_average_price', {
    product_code_input: productId,
  });
  if (error) throw new Error(error.message);
  return data || 0;
};

const fetchSuggestedPrice = async (productId: string) => {
  const { data, error } = await supabase
    .from('suggested_prices')
    .select('price')
    .eq('product_code', productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.price || null;
};

const updateProductDetails = async ({
  productId,
  salePrice,
  minimumStock,
  discontinued,
}: {
  productId: string;
  salePrice: number;
  minimumStock: number;
  discontinued: boolean;
}) => {
  const { error, data } = await supabase
    .from('products')
    .update({
      sale_price: salePrice,
      minimum_stock: minimumStock,
      discontinued,
    })
    .eq('product_code', productId);

  if (error) throw new Error(error.message);
};

const updateProductImage = async ({
  productId,
  imageUrl,
}: {
  productId: string;
  imageUrl: string;
}) => {
  const { error } = await supabase
    .from('products')
    .update({
      image_url: imageUrl,
    })
    .eq('product_code', productId);

  if (error) throw new Error(error.message);
};

export default function ProductEdit() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const toast = useToastController();
  const router = useRouter();
  const theme = useTheme() || 'light';

  const [minimumStock, setMinimumStock] = useState<number>(0);
  const [discontinued, setDiscontinued] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: product,
    error: productError,
    isLoading: productLoading,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
  });

  const {
    data: avgPrice,
    error: avgError,
    isLoading: avgLoading,
  } = useQuery({
    queryKey: ['averagePrice', id],
    queryFn: () => fetchAveragePrice(id as string),
  });

  const {
    data: suggestedPrice,
    error: suggestedError,
    isLoading: suggestedLoading,
  } = useQuery({
    queryKey: ['suggestedPrice', id],
    queryFn: () => fetchSuggestedPrice(id as string),
  });

  const mutation = useMutation({
    mutationFn: updateProductDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products_list', ''] });
      queryClient.invalidateQueries({ queryKey: ['low_stock_products'] });
      toast.show('Tudo certo!', {
        message: 'Dados salvos com sucesso!',
      });
      router.dismissTo('/(drawer)/products');
    },
    onError: () => {},
  });

  const mutationImage = useMutation({
    mutationFn: updateProductImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products_list', ''] });

      toast.show('Tudo certo!', {
        message: 'Dados salvos com sucesso!',
      });
    },
    onError: () => {},
  });

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateProduct>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      sale_price: 0,
    },
  });

  const handleUpdate = (data: UpdateProduct) => {
    mutation.mutate({
      productId: id as string,
      salePrice: data.sale_price,
      minimumStock,
      discontinued,
    });
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();

      const params = {
        Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME as string,
        Key: `products/${id}.jpg`,
        Body: blob,
        ContentType: 'image/jpeg',
      };

      try {
        const data = await s3.upload(params).promise();
        const publicUrl = data.Location;
        setImageUrl(publicUrl);

        mutationImage.mutate({
          productId: id as string,
          imageUrl: publicUrl,
        });
      } catch (error) {
        console.error('Erro ao fazer upload para S3:', error);
      }
    }
  };

  const deleteImage = async () => {
    const params: DeleteObjectRequest = {
      Bucket: process.env.EXPO_PUBLIC_AWS_BUCKET_NAME as string,
      Key: `products/${id}.jpg`,
    };

    try {
      await s3.deleteObject(params).promise();

      mutationImage.mutate({
        productId: id as string,
        imageUrl: '',
      });
      setImageUrl(null);
    } catch (error) {
      console.error('Erro ao fazer upload para S3:', error);
      toast.show('Erro', {
        message: 'Erro ao excluir a imagem!',
        customData: {
          myPreset: 'error',
        },
      });
    }
  };

  const openShareDialogAsync = async () => {
    if (product?.image_url) {
      const fileDetails = {
        extension: 'jpg',
        shareOptions: {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartilhar imagem',
          UTI: 'image/jpeg',
        },
      };
      const downloadPath = `${FileSystem.cacheDirectory}${product.product_name}.${fileDetails.extension}`;
      const { uri: localUrl } = await FileSystem.downloadAsync(
        product.image_url,
        downloadPath,
      );
      if (!(await Sharing.isAvailableAsync())) return;
      await Sharing.shareAsync(localUrl, fileDetails.shareOptions);
    }
  };

  const incrementQuantity = () => {
    setMinimumStock(minimumStock + 1);
  };

  const decrementQuantity = () => {
    setMinimumStock(prev => (prev > 0 ? prev - 1 : prev));
  };

  useEffect(() => {
    if (product) {
      setValue('sale_price', product.sale_price || 0);
      setMinimumStock(product.minimum_stock || 0);
      setDiscontinued(product.discontinued || false);
      setImageUrl(product.image_url || null);
    }
  }, [product]);

  if (productLoading)
    return (
      <YStack
        flex={1}
        padding="$4"
        paddingTop="$10"
        backgroundColor="$background"
        alignItems="center"
        gap={10}
      >
        <Loading message="Carregando produto..." />
      </YStack>
    );

  if (productError || !product)
    return (
      <YStack flex={1} padding="$4" backgroundColor="$background">
        <Text>Error: {productError?.message}</Text>
      </YStack>
    );

  return (
    <YStack flex={1} padding="$4" backgroundColor="$background">
      <Text fontSize={8}>{product.product_code}</Text>
      <Text fontSize="$4" fontWeight="500">
        {product.product_name}
      </Text>

      <XStack paddingBlock={'$2'}>
        <Pressable
          onPress={() => (imageUrl ? setModalVisible(true) : pickImage())}
        >
          {imageUrl ? (
            <View>
              <Image
                source={{ uri: imageUrl }}
                width={100}
                height={100}
                borderTopStartRadius="$4"
                borderTopEndRadius="$4"
                borderWidth={1}
                borderColor={'$borderColor'}
              />
              <Button
                onPress={deleteImage}
                height={30}
                justifyContent="center"
                alignItems="center"
                borderRadius={0}
                borderBottomLeftRadius={'$4'}
                borderBottomRightRadius={'$4'}
              >
                <Feather
                  name="trash-2"
                  color={theme.color10?.val}
                  size={16}
                  style={{ alignSelf: 'center' }}
                />
              </Button>
            </View>
          ) : (
            <View
              width={100}
              height={100}
              justifyContent="center"
              alignItems="center"
              borderRadius="$4"
              borderWidth={1}
              backgroundColor={'$color3'}
              borderColor={'$borderColor'}
            >
              <Feather name="image" size={24} color={theme.color9?.val} />
            </View>
          )}
        </Pressable>
      </XStack>

      <YStack gap="$4">
        <YStack gap="$2">
          {avgPrice !== null && (
            <View style={{ marginVertical: 10 }}>
              <Text fontSize={12} color={theme.color11?.val}>
                Preço médio de compra: {formatCurrency(avgPrice || 0)}
              </Text>
              <Text fontSize={12} color={theme.color9?.val}>
                Preço de venda sugerido (
                {suggestedPrice === null
                  ? '120%'
                  : `${(((suggestedPrice! - avgPrice!) / avgPrice!) * 100 || 0).toFixed(0)}% `}
                de lucro):{' '}
                {formatCurrency(
                  suggestedPrice !== null
                    ? suggestedPrice || 0
                    : (avgPrice || 0) * 2.2,
                )}
              </Text>
            </View>
          )}
          <CurrencyFormField
            name="sale_price"
            control={control}
            label="Preço de venda"
          />
        </YStack>

        <YStack gap="$2">
          <Text>Quantidade mínima:</Text>
          <XStack gap="$2" alignItems="center">
            <Button onPress={decrementQuantity} color={theme.color10?.val}>
              -
            </Button>
            <Text fontSize={'$4'}>
              {minimumStock.toString().padStart(2, '0')}
            </Text>
            <Button onPress={incrementQuantity} color={theme.color10?.val}>
              +
            </Button>
          </XStack>
        </YStack>

        <XStack alignItems="center" gap="$2">
          <Switch
            size={'$4'}
            checked={discontinued}
            onCheckedChange={setDiscontinued}
          >
            <Switch.Thumb animation="fast" />
          </Switch>
          <Text>Produto descontinuado</Text>
        </XStack>

        <Button onPress={handleSubmit(handleUpdate)} theme={'active'}>
          Salvar
        </Button>
      </YStack>

      <Modal visible={modalVisible} animationType="fade">
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="flex-start"
          paddingTop="$11"
          backgroundColor={'$background'}
          paddingHorizontal="$4"
        >
          <Button
            onPress={() => setModalVisible(false)}
            marginBottom="$15"
            circular
            alignSelf="flex-end"
          >
            <Feather name="x" size={24} color={theme.color10?.val} />
          </Button>
          <Image
            source={{ uri: imageUrl as string }}
            width={300}
            height={300}
            borderRadius="$4"
          />
          <Button
            onPress={openShareDialogAsync}
            marginTop="$4"
            theme={'active'}
          >
            <Feather name="share" size={20} color={theme.color.val} />
            <Text marginLeft="$2">Compartilhar</Text>
          </Button>
        </YStack>
      </Modal>
    </YStack>
  );
}
