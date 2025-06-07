import LottieView from 'lottie-react-native';
import { Text, YStack } from 'tamagui';
interface Props {
  message?: string;
}
export const Loading = ({ message }: Props) => {
  return (
    <YStack flex={1} alignItems="center" padding={'$2'}>
      <LottieView
        autoPlay
        style={{
          width: 100,
          height: 100,
          // backgroundColor: '#eee',
        }}
        source={require('@/assets/lottie/loading.json')}
      />
      <Text>{message}</Text>
    </YStack>
  );
};
