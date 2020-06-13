import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { useAuth } from '../../hooks/auth';

import api from '../../services/api';

import * as Styled from './styles';

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface Availability {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const { goBack, navigate } = useNavigation();
  const route = useRoute();
  const routeParams = route.params as RouteParams;

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );
  const [availability, setAvailability] = useState<Availability[]>([]);

  useEffect(() => {
    api.get('providers').then((response) => {
      setProviders(response.data);
    });
  }, []);

  useEffect(() => {
    api
      .get(`providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then((response) => {
        setAvailability(response.data);
      });
  }, [selectedDate, selectedProvider]);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToogleDataPicker = useCallback(() => {
    setShowCalendar((state) => !state);
  }, []);

  const handleDateChanged = useCallback((_, date: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowCalendar(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  }, []);

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);
      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('/appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento!',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente',
      );
    }
  }, [navigate, selectedProvider, selectedDate, selectedHour]);

  const morningAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ hour, available }) => {
        return {
          hour,
          available,
          hourFormatted: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  return (
    <Styled.Container>
      <Styled.Header>
        <Styled.BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </Styled.BackButton>

        <Styled.HeaderTitle>Cabeleireiros</Styled.HeaderTitle>

        <Styled.UserAvatar source={{ uri: user.avatar_url }} />
      </Styled.Header>

      <Styled.Content>
        <Styled.ProvidersListContainer>
          <Styled.ProvidersList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={providers}
            keyExtractor={(provider) => provider.id}
            renderItem={({ item: provider }) => (
              <Styled.ProviderContainer
                selected={provider.id === selectedProvider}
                onPress={() => handleSelectProvider(provider.id)}
              >
                <Styled.ProviderAvatar source={{ uri: provider.avatar_url }} />
                <Styled.ProviderName
                  selected={provider.id === selectedProvider}
                >
                  {provider.name}
                </Styled.ProviderName>
              </Styled.ProviderContainer>
            )}
          />
        </Styled.ProvidersListContainer>

        <Styled.Calendar>
          <Styled.Title>Escolha a data</Styled.Title>

          <Styled.OpenDatePickerButton onPress={handleToogleDataPicker}>
            <Styled.OpenDatePickerText>
              Selecionar outra data
            </Styled.OpenDatePickerText>
          </Styled.OpenDatePickerButton>

          {showCalendar && (
            <DateTimePicker
              mode="date"
              display="calendar"
              textColor="#f4ede8"
              value={selectedDate}
              onChange={handleDateChanged}
            />
          )}
        </Styled.Calendar>

        <Styled.Schedule>
          <Styled.Title>Escolha o horário</Styled.Title>

          <Styled.Section>
            <Styled.SectionTitle>Manhã</Styled.SectionTitle>

            <Styled.SectionContent>
              {morningAvailability.map(({ hour, hourFormatted, available }) => (
                <Styled.Hour
                  key={hourFormatted}
                  enabled={available}
                  available={available}
                  selected={selectedHour === hour}
                  onPress={() => handleSelectHour(hour)}
                >
                  <Styled.HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </Styled.HourText>
                </Styled.Hour>
              ))}
            </Styled.SectionContent>
          </Styled.Section>

          <Styled.Section>
            <Styled.SectionTitle>Tarde</Styled.SectionTitle>

            <Styled.SectionContent>
              {afternoonAvailability.map(
                ({ hour, hourFormatted, available }) => (
                  <Styled.Hour
                    key={hourFormatted}
                    enabled={available}
                    available={available}
                    selected={selectedHour === hour}
                    onPress={() => handleSelectHour(hour)}
                  >
                    <Styled.HourText selected={selectedHour === hour}>
                      {hourFormatted}
                    </Styled.HourText>
                  </Styled.Hour>
                ),
              )}
            </Styled.SectionContent>
          </Styled.Section>
        </Styled.Schedule>

        <Styled.CreateAppointmentButton onPress={handleCreateAppointment}>
          <Styled.CreateAppointmentButtonText>
            Agendar
          </Styled.CreateAppointmentButtonText>
        </Styled.CreateAppointmentButton>
      </Styled.Content>
    </Styled.Container>
  );
};

export default CreateAppointment;
