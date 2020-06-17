import React, { useRef, useCallback } from 'react';
import { View, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker';
import * as Yup from 'yup';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Wrapper,
  Container,
  BackButton,
  UserAvatarButton,
  UserAvatar,
  Title,
} from './styles';

interface ProfileFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const emailRef = useRef<TextInput>(null);
  const oldPasswordRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione um avatar',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar Câmera',
        chooseFromLibraryButtonTitle: 'Selecionar da galeria',
        customButtons: [{ name: 'remove', title: 'Remover Avatar' }],
      },
      async (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert('Erro ao tentar atualizar seu avatar');
          return;
        }

        if (response.customButton) {
          api.delete('/users/avatar/delete').then((apiResponse) => {
            updateUser(apiResponse.data);
          });
          return;
        }

        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpeg`,
          uri: response.uri,
        });

        api.patch('users/avatar', data).then((apiResponse) => {
          updateUser(apiResponse.data);
        });
      },
    );
  }, [user, updateUser]);

  const handleUpdatedProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),

          email: Yup.string()
            .email('Digite um e-mail válido')
            .required('E-mail obrigatório'),

          old_password: Yup.string(),

          password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string().min(
              8,
              'Nova senha precisa ter no mínimo 8 dígitos',
            ),
            otherwise: Yup.string(),
          }),

          password_confirmation: Yup.string()
            .when('old_password', {
              is: (val) => !!val.length,
              then: Yup.string().min(8, 'Confirmação de senha é obrigatória'),
              otherwise: Yup.string(),
            })
            .oneOf(
              [Yup.ref('password'), null],
              'Confirmação não correspondente',
            ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          name,
          email,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          name,
          email,
          ...(old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Perfil atualizado com sucesso!');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro na atualização do perfil',
          'Ocorreu um erro ao tentar atualizar seu perfil, tente novamente',
        );
      }
    },
    [navigation, updateUser],
  );

  return (
    <Wrapper>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        <Container>
          <BackButton onPress={handleGoBack}>
            <Icon name="chevron-left" size={24} color="#999591" />
          </BackButton>

          <UserAvatarButton onPress={handleUpdateAvatar}>
            <UserAvatar source={{ uri: user.avatar_url }} />
          </UserAvatarButton>

          <View>
            <Title>Meu Perfil</Title>
          </View>

          <Form
            initialData={user}
            ref={formRef}
            onSubmit={handleUpdatedProfile}
          >
            <Input
              autoCapitalize="words"
              name="name"
              icon="user"
              placeholder="Nome"
              returnKeyType="next"
              onSubmitEditing={() => {
                emailRef.current?.focus();
              }}
            />

            <Input
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="email-address"
              ref={emailRef}
              name="email"
              icon="mail"
              placeholder="E-mail"
              returnKeyType="next"
              onSubmitEditing={() => {
                oldPasswordRef.current?.focus();
              }}
            />

            <Input
              ref={oldPasswordRef}
              secureTextEntry
              textContentType="newPassword"
              name="old_password"
              icon="lock"
              placeholder="Senha atual"
              containerStyle={{ marginTop: 16 }}
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordRef.current?.focus();
              }}
            />

            <Input
              ref={passwordRef}
              secureTextEntry
              textContentType="newPassword"
              name="password"
              icon="lock"
              placeholder="Nova Senha"
              returnKeyType="next"
              onSubmitEditing={() => {
                confirmPasswordRef.current?.focus();
              }}
            />

            <Input
              ref={confirmPasswordRef}
              secureTextEntry
              textContentType="newPassword"
              name="password_confirmation"
              icon="lock"
              placeholder="Confirmar nova senha"
              returnKeyType="send"
              onSubmitEditing={() => {
                formRef.current?.submitForm();
              }}
            />

            <Button onPress={() => formRef.current?.submitForm()}>
              Confirmar Mudanças
            </Button>
          </Form>
        </Container>
      </ScrollView>
    </Wrapper>
  );
};

export default Profile;
