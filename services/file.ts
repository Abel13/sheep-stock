import { api } from './api';

const uploadFile = async (data: FormData) => {
  try {
    const response = await api.post('/upload/', data);

    return response;
  } catch (error) {
    throw new Error('Falha ao enviar o arquivo');
  }
};

export { uploadFile };
