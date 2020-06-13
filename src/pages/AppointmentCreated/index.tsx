import React, { useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Icon from 'react-native-vector-icons/Feather';

import { useNavigation, useRoute } from '@react-navigation/native';
import * as Styled from './styles';

interface RouteParams {
  date: number;
}

const AppointmentCreated: React.FC = () => {
  const { reset } = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  const handleOkPressed = useCallback(() => {
    reset({
      routes: [
        {
          name: 'Dashboard',
        },
      ],
      index: 0,
    });
  }, [reset]);

  const formattedDate = useMemo(() => {
    return format(
      routeParams.date,
      "EEEE', dia' dd 'de' MMMM 'de' yyyy 'às' HH:mm'h'",
      { locale: ptBR },
    );
  }, [routeParams]);

  return (
    <Styled.Container>
      <Icon name="check" size={80} color="#04d361" />

      <Styled.Title>Agendamento Concluído</Styled.Title>
      <Styled.Description>{formattedDate}</Styled.Description>

      <Styled.Button onPress={handleOkPressed}>
        <Styled.ButtonText>Ok</Styled.ButtonText>
      </Styled.Button>
    </Styled.Container>
  );
};

export default AppointmentCreated;
