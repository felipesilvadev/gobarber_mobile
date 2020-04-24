import React from 'react';
import { View } from 'react-native';
import Button from '../../components/Button';

import { useAuth } from '../../hooks/auth';

// import { Container } from './styles';

const Dashboard: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
      }}
    >
      <Button onPress={signOut}>LogOut</Button>
    </View>
  );
};

export default Dashboard;
