import { api } from './api';

const uploadFile = async (data: FormData) => {
  try {
    console.log('INICIOU');
    const response = await api.post('/upload-via-aroma/', data);
    console.log('RESPONSE');

    return response;
  } catch (error) {
    console.log('ERROR');
    throw new Error('Falha ao enviar o arquivo');
  }
};

export { uploadFile };
