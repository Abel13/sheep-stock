import { CurrencyFormField } from '@/components/molecules/FormField/CurrencyFormField';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { set, useForm } from 'react-hook-form';
import { Modal, Pressable } from 'react-native';
import {
  Button,
  Card,
  View,
  Text,
  XStack,
  YStack,
  Image,
  useTheme,
  VisuallyHidden,
  Switch,
} from 'tamagui';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import AWS from 'aws-sdk';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabaseClient';
import { useToastController } from '@tamagui/toast';
import { DeleteObjectRequest } from 'aws-sdk/clients/s3';
import { InsertService, Service, UpdateService } from '@/types/Service';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SwitchFormField } from '@/components/molecules/FormField/SwitchField';
import { createService, updateService } from '@/services/service';

// Configuração do S3
AWS.config.update({
  accessKeyId: process.env.EXPO_PUBLIC_AWS_ACCESS_KEY,
  secretAccessKey: process.env.EXPO_PUBLIC_AWS_SECRET_KEY,
  region: process.env.EXPO_PUBLIC_AWS_REGION,
});

const s3 = new AWS.S3();

const schema = yup.object().shape({
  price: yup.number().required('Informe o preço').min(0, 'Informe o preço'),
  name: yup.string().required('Informe o nome do serviço'),
  discontinued: yup.boolean().required(),
});

const fetchServiceById = async (serviceId: string): Promise<Service> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('service_code', serviceId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export default function ServicePage() {
  const { id } = useLocalSearchParams();
  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      price: 0,
      discontinued: false,
    },
  });

  const mode = !id ? 'create' : 'update';

  const theme = useTheme();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const saveService = async (data: InsertService | UpdateService) => {
    try {
      if (mode === 'create')
        await createService({ serviceData: data as InsertService });
      if (mode === 'update')
        await updateService({
          id: id as string,
          serviceData: data as UpdateService,
        });

      toast.show('Tudo certo!', {
        message: 'Serviço salvo com sucesso',
      });
      queryClient.invalidateQueries({ queryKey: ['services_list', ''] });
    } catch (error) {
      toast.show('Erro', {
        message: 'Falha ao salvar o serviço',
      });
    }
  };

  const toast = useToastController();
  const queryClient = useQueryClient();

  const {
    data: service,
    error: serviceError,
    isLoading: serviceLoading,
  } = useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchServiceById(id as string),
  });

  const updateServiceImage = async ({
    serviceId,
    imageUrl,
  }: {
    serviceId: string;
    imageUrl: string;
  }) => {
    const { error } = await supabase
      .from('services')
      .update({
        image_url: imageUrl,
      })
      .eq('service_code', serviceId);

    if (error) throw new Error(error.message);
  };

  const mutationImage = useMutation({
    mutationFn: updateServiceImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      queryClient.invalidateQueries({ queryKey: ['services_list', ''] });

      toast.show('Tudo certo!', {
        message: 'Dados salvos com sucesso!',
      });
    },
    onError: () => {},
  });

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
          serviceId: id as string,
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
      Key: `services/${id}.jpg`,
    };

    try {
      await s3.deleteObject(params).promise();

      mutationImage.mutate({
        serviceId: id as string,
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
    if (service?.image_url) {
      const fileDetails = {
        extension: 'jpg',
        shareOptions: {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartilhar imagem',
          UTI: 'image/jpeg',
        },
      };
      const downloadPath = `${FileSystem.cacheDirectory}${service.name}.${fileDetails.extension}`;
      const { uri: localUrl } = await FileSystem.downloadAsync(
        service.image_url,
        downloadPath,
      );
      if (!(await Sharing.isAvailableAsync())) return;
      await Sharing.shareAsync(localUrl, fileDetails.shareOptions);
    }
  };

  const setValues = () => {
    if (service) {
      setValue('name', service.name);
      setValue('price', service.price);
      setValue('discontinued', service.discontinued);
      setImageUrl(service.image_url);
    }
  };

  useEffect(() => {
    if (service?.service_code) setValues();
  }, [service]);

  return (
    <YStack flex={1} backgroundColor={'$background'} paddingBlock={'$4'}>
      {mode === 'update' && (
        <XStack justifyContent="center">
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
      )}

      <YStack paddingHorizontal={'$4'} gap={'$2'}>
        <FormField
          control={control}
          name="name"
          label="Nome"
          placeholder="Nome do serviço"
        />
        <CurrencyFormField
          control={control}
          name="price"
          label="Preço"
          placeholder="100.00"
        />

        <XStack alignItems="center" gap="$2" marginBottom={'$6'}>
          <SwitchFormField name="discontinued" control={control} size={'$4'}>
            <Switch.Thumb animation="fast" />
          </SwitchFormField>
          <Text>Produto descontinuado</Text>
        </XStack>
        <Button onPress={handleSubmit(saveService)}>Salvar</Button>
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
