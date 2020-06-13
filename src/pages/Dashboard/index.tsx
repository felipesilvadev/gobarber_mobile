import React, { useCallback, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

import api from '../../services/api';
import { useAuth } from '../../hooks/auth';

import * as Styled from './styles';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useNavigation();

  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    api.get('providers').then((response) => {
      setProviders(response.data);
    });
  }, []);

  const navigateToProfile = useCallback(() => {
    navigate('Profile');
  }, [navigate]);

  const navigateToCreateAppointment = useCallback(
    (providerId: string) => {
      navigate('CreateAppointment', { providerId });
    },
    [navigate],
  );

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.HeaderTitle>
          Bem vindo, {'\n'}
          <Styled.UserName>{user.name}</Styled.UserName>
        </Styled.HeaderTitle>

        <Styled.ProfileButton onPress={navigateToProfile}>
          <Styled.UserAvatar source={{ uri: user.avatar_url }} />
        </Styled.ProfileButton>
      </Styled.Header>

      <Styled.ProvidersList
        ListHeaderComponent={
          <Styled.ProvidersListTitle>Cabeleireiros</Styled.ProvidersListTitle>
        }
        data={providers}
        keyExtractor={(provider) => provider.id}
        renderItem={({ item: provider }) => (
          <Styled.ProviderContainer
            onPress={() => navigateToCreateAppointment(provider.id)}
          >
            <Styled.ProviderAvatar source={{ uri: provider.avatar_url }} />

            <Styled.ProviderInfo>
              <Styled.ProviderName>{provider.name}</Styled.ProviderName>

              <Styled.ProviderMeta>
                <Icon name="calendar" size={14} color="#ff9000" />
                <Styled.ProviderMetaText>
                  Segunda à Sexta
                </Styled.ProviderMetaText>
              </Styled.ProviderMeta>

              <Styled.ProviderMeta>
                <Icon name="clock" size={14} color="#ff9000" />
                <Styled.ProviderMetaText>8h às 17:00</Styled.ProviderMetaText>
              </Styled.ProviderMeta>
            </Styled.ProviderInfo>
          </Styled.ProviderContainer>
        )}
      />
    </Styled.Container>
  );
};

export default Dashboard;
