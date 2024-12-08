import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from 'react-native';
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
  Input,
  Card,
  Switch,
  Image,
} from 'tamagui';
import { useToastController } from '@tamagui/toast';

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

const updateProductDetails = async ({
  productId,
  salePrice,
  minimumStock,
  discontinued,
  imageUrl,
}: {
  productId: string;
  salePrice: number;
  minimumStock: number;
  discontinued: boolean;
  imageUrl: string;
}) => {
  const { error } = await supabase
    .from('products')
    .update({
      sale_price: salePrice,
      minimum_stock: minimumStock,
      discontinued,
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

  const [salePrice, setSalePrice] = useState<string>('');
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

  const mutation = useMutation({
    mutationFn: updateProductDetails,
    onSuccess: () => {
      toast.show('Tudo certo!', {
        message: 'Dados salvos com sucesso!',
      });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products_list', ''] });
      router.back();
    },
  });

  const handleUpdate = () => {
    const parsedPrice = parseFloat(salePrice);
    if (isNaN(parsedPrice)) return;

    mutation.mutate({
      productId: id as string,
      salePrice: parsedPrice,
      minimumStock,
      discontinued,
      imageUrl: imageUrl || '',
    });
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();

      const params = {
        Bucket: 'sheep-stock',
        Key: `products/${id}.jpg`,
        Body: blob,
        ContentType: 'image/jpeg',
      };

      try {
        const data = await s3.upload(params).promise();
        const publicUrl = data.Location;
        setImageUrl(publicUrl);

        mutation.mutate({
          productId: id as string,
          salePrice: parseFloat(salePrice),
          minimumStock,
          discontinued,
          imageUrl: publicUrl,
        });
      } catch (error) {
        console.error('Erro ao fazer upload para S3:', error);
      }
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
      setSalePrice(product.sale_price?.toString() || '');
      setMinimumStock(product.minimum_stock || 0);
      setDiscontinued(product.discontinued || false);
      setImageUrl(product.image_url || null);
    }
  }, [product]);

  if (productLoading) return <Text>Loading...</Text>;
  if (productError || !product)
    return <Text>Error: {productError?.message}</Text>;

  return (
    <YStack flex={1} padding="$4" backgroundColor="$background">
      <Text fontSize={8}>{product.product_code}</Text>
      <Text fontSize="$4" fontWeight="500">
        {product.product_name}
      </Text>

      <Card
        onPress={() => (imageUrl ? setModalVisible(true) : pickImage())}
        width={100}
        height={100}
        bordered
        pressTheme
        justifyContent="center"
        alignItems="center"
        marginBlock="$2"
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            width={100}
            height={100}
            borderRadius="$4"
            borderWidth={1}
            borderColor={'$borderColor'}
          />
        ) : (
          <Feather name="image" size={24} />
        )}
      </Card>

      <YStack marginTop="$4" gap="$4">
        <YStack gap="$2">
          <Text>Preço de venda:</Text>
          <Input
            placeholder="Insira o novo preço"
            value={salePrice}
            onChangeText={text =>
              setSalePrice(text.replace(',', '.').replace(/[^0-9.]/g, ''))
            }
            keyboardType="numeric"
          />
        </YStack>

        <YStack gap="$2">
          <Text>Quantidade mínima:</Text>
          <XStack gap="$2" alignItems="center">
            <Button onPress={decrementQuantity}>-</Button>
            <Text fontSize={'$4'}>
              {minimumStock.toString().padStart(2, '0')}
            </Text>
            <Button onPress={incrementQuantity}>+</Button>
          </XStack>
        </YStack>

        <XStack alignItems="center" gap="$2">
          <Switch
            size={'$4'}
            checked={discontinued}
            onCheckedChange={setDiscontinued}
          >
            <Switch.Thumb animation="quicker" />
          </Switch>
          <Text>Produto descontinuado</Text>
        </XStack>

        <Button onPress={handleUpdate}>Salvar</Button>
      </YStack>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="flex-start"
          backgroundColor="#010101e0"
          paddingTop="$11"
          paddingHorizontal="$4"
        >
          <Button
            onPress={() => setModalVisible(false)}
            marginBottom="$15"
            circular
            alignSelf="flex-end"
          >
            <Feather name="x" size={24} color="#000" />
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
            backgroundColor="$background"
          >
            <Feather name="share" size={20} color="#000" />
            <Text marginLeft="$2">Compartilhar</Text>
          </Button>
        </YStack>
      </Modal>
    </YStack>
  );
}
