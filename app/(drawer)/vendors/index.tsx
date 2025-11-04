import { supabase } from '@/services/supabaseClient';
import { Seller, InsertSeller, UpdateSeller } from '@/types/Seller';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Alert, FlatList } from 'react-native';
import {
  Button,
  Card,
  Input,
  Spacer,
  Text,
  XStack,
  YStack,
  useTheme,
} from 'tamagui';

type Vendor = Seller;

const TABLE = 'sellers';

async function listVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase.from(TABLE).select('*').order('name');
  if (error) throw error;
  return (data as Vendor[]) || [];
}

async function createVendor(payload: InsertSeller) {
  const { error } = await supabase.from(TABLE).insert(payload);
  if (error) throw error;
}

async function updateVendor(id: string, payload: UpdateSeller) {
  const { error } = await supabase.from(TABLE).update(payload).eq('id', id);
  if (error) throw error;
}

async function deleteVendor(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export default function VendorsPage() {
  const theme = useTheme();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [TABLE],
    queryFn: listVendors,
  });

  const { mutate: save, isPending: saving } = useMutation({
    mutationFn: async () => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error('Informe o nome');
      if (editingId) return updateVendor(editingId, { name: trimmed });
      return createVendor({ name: trimmed });
    },
    onSuccess: async () => {
      setName('');
      setEditingId(null);
      await qc.invalidateQueries({ queryKey: [TABLE] });
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteVendor,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [TABLE] });
    },
  });

  useEffect(() => {
    // garante dados atualizados ao abrir a tela
    refetch();
  }, [refetch]);

  const onEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setName(vendor.name);
  };

  const onDelete = (vendor: Vendor) => {
    Alert.alert('Excluir vendedor', `Deseja excluir "${vendor.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => remove(vendor.id),
      },
    ]);
  };

  return (
    <YStack flex={1} padding="$4" backgroundColor="$background" gap="$3">
      <Text fontSize={18} fontWeight={600} color="$color">
        Vendedores
      </Text>

      <XStack gap="$2">
        <Input
          flex={1}
          value={name}
          onChangeText={setName}
          placeholder="Nome do vendedor"
        />
        <Button
          onPress={() => save()}
          disabled={saving}
          backgroundColor={theme.color5?.val}
          color={theme.color12?.val}
        >
          {editingId ? 'Salvar' : 'Adicionar'}
        </Button>
      </XStack>

      <Spacer size="$2" />

      <FlatList
        data={data || []}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <Spacer size="$2" />}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <Card bordered padding="$3" backgroundColor="$background">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={16}>{item.name}</Text>
              <XStack gap="$2">
                <Button
                  size="$2"
                  onPress={() => onEdit(item)}
                  backgroundColor={theme.color4?.val}
                >
                  Editar
                </Button>
                <Button
                  size="$2"
                  onPress={() => onDelete(item)}
                  backgroundColor={theme.red8?.val}
                >
                  Excluir
                </Button>
              </XStack>
            </XStack>
          </Card>
        )}
      />
    </YStack>
  );
}
