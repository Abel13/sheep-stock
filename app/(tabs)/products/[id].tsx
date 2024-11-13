import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { View, Text, TextInput, Alert, Switch, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Button, ButtonText } from '@/components/ui/button';
import AWS from 'aws-sdk';
import { supabase } from '@/services/supabaseClient';
import { Product } from '@/types/Product';
import { Feather } from '@expo/vector-icons';

// Configuração do S3
AWS.config.update({
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_KEY,
  region: process.env.EXPO_PUBLIC_AWS_REGION,
});

const s3 = new AWS.S3();

const fetchProductById = async (productId: string): Promise<Product> => {
  const { data, error } = await supabase.from('products').select('*').eq('product_code', productId).single();
  if (error) throw new Error(error.message);
  return data;
};

const updateProductDetails = async ({ productId, salePrice, minimumStock, discontinued, imageUrl }: {
  productId: string,
  salePrice: number,
  minimumStock: number,
  discontinued: boolean,
  imageUrl: string
}) => {
  const { error } = await supabase.from('products').update({ sale_price: salePrice, minimum_stock: minimumStock, discontinued, image_url: imageUrl }).eq('product_code', productId);
  if (error) throw new Error(error.message);
};

export default function ProductEdit() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [salePrice, setSalePrice] = useState<string>('');
  const [minimumStock, setMinimumStock] = useState<string>('');
  const [discontinued, setDiscontinued] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: product, error: productError, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
  });

  const mutation = useMutation({
    mutationFn: updateProductDetails,
    onSuccess: () => {
      Alert.alert('Sucesso', 'Detalhes do produto atualizados com sucesso!');
      queryClient.invalidateQueries({
        queryKey: ['product', id]
      });
    },
  });

  const handleUpdate = () => {
    const parsedPrice = parseFloat(salePrice);
    const parsedMinimumStock = parseInt(minimumStock);

    if (isNaN(parsedPrice) || isNaN(parsedMinimumStock)) {
      Alert.alert('Entrada inválida', 'Insira valores válidos para o preço e quantidade mínima.');
      return;
    }
    mutation.mutate({
      productId: id as string,
      salePrice: parsedPrice,
      minimumStock: parsedMinimumStock,
      discontinued,
      imageUrl: imageUrl || ''
    });
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'É necessário permitir o acesso aos arquivos para enviar a imagem.');
        return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
    });

    if (!result.canceled) {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();

        // Parâmetros para o upload no S3, sem a propriedade ACL
        const params = {
            Bucket: 'sheep-stock', // Nome do bucket S3
            Key: `products/${id}.jpg`, // Caminho e nome do arquivo no S3
            Body: blob,
            ContentType: 'image/jpeg',
        };

        try {
            const data = await s3.upload(params).promise();
            const publicUrl = data.Location;
            setImageUrl(publicUrl);

            // Atualiza a URL da imagem no banco de dados
            mutation.mutate({
                productId: id as string,
                salePrice: parseFloat(salePrice),
                minimumStock: parseInt(minimumStock),
                discontinued,
                imageUrl: publicUrl,
            });
        } catch (error) {
            console.log('Erro ao fazer upload para S3:', error);
            Alert.alert('Erro', 'Falha ao fazer o upload da imagem.');
        }
    }
};

  useEffect(() => {
    if (product) {
      setSalePrice(product.sale_price?.toString() || '');
      setMinimumStock(product.minimum_stock?.toString() || '');
      setDiscontinued(product.discontinued || false);
      setImageUrl(product.image_url || null);
    }
  }, [product]);

  if (productLoading) return <Text>Loading...</Text>;
  if (productError || !product) return <Text>Error: {productError?.message}</Text>;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: Colors.light.background }}>
      <Text style={{ marginBottom: 5, fontSize: 12 }}>{product.product_code}</Text>
      <Text style={{ marginBottom: 10, fontSize: 18 }}>{product.product_name}</Text>

      {imageUrl ?
        <Image source={{ uri: imageUrl }} style={{ width: 100, height: 100, marginVertical: 10, borderRadius: 4, borderWidth: 1 }} /> :
        <View style={{ height: 100, width: 100, borderWidth: 1, borderRadius: 4, justifyContent: 'center', alignItems: 'center', borderColor: Colors.light.tabIconDefault }}>
          <Feather name='image' size={24} color={Colors.light.tabIconDefault}/>
        </View>
      }
      <Button onPress={pickImage} variant="link">
        <ButtonText>alterar imagem</ButtonText>
      </Button>

      <View style={{ marginVertical: 20, gap: 10 }}>
        <Text style={{color: Colors.light.icon}}>Preço de venda</Text>
        <TextInput
          placeholder="Insira o novo preço"
          value={salePrice}
          onChangeText={(text) => setSalePrice(text.replace(',', '.').replace(/[^0-9.]/g, ''))}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: Colors.light.icon, padding: 10}}
        />

        <Text style={{color: Colors.light.icon}}>Quantidade mínima</Text>
        <TextInput
          placeholder="Quantidade mínima de estoque"
          value={minimumStock}
          onChangeText={(text) => setMinimumStock(text.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: Colors.light.icon, padding: 10 }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
          <Switch
            value={discontinued}
            onValueChange={setDiscontinued}
          />
          <Text style={{ color: Colors.light.icon, marginLeft: 10 }}>Produto descontinuado</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 50 }}>
        <Button onPress={handleUpdate} action="primary" variant="solid">
          <ButtonText>Salvar</ButtonText>
        </Button>
      </View>
    </View>
  );
}