// app/index.tsx
import { Button } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function Home() {
  return (
    <View>
      <Text>Welcome to Sheep Stock</Text>
      <Center className="bg-primary-500 h-[200px] w-[300px]">
        <Link href="/products">
          <Text>Go to products</Text>
        </Link>
      </Center>
    </View>
  );
}
