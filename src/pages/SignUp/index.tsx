import React, { useRef, useCallback } from 'react';
import { Image, View, ScrollView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import api from '../../services/api';

import getValidationErrors from '../../utils/getValidationErrors';

import logoImg from '../../assets/logo.png';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Wrapper,
  Container,
  Title,
  BackToSignIn,
  BackToSignInText,
} from './styles';

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const navigation = useNavigation();

  const handleSignUp = useCallback(
    async (data: SignUpFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .email('Digite um e-mail válido')
            .required('E-mail obrigatório'),
          password: Yup.string().min(
            8,
            'Senha precisa ter no mínimo 8 dígitos',
          ),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        await api.post('/users', data);

        navigation.navigate('SignIn');

        Alert.alert(
          'Cadastro realizado',
          'Você já pode realizar o seu logon no GoBarber',
        );
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);

          return;
        }

        Alert.alert(
          'Erro no cadastro',
          'Ocorreu um erro ao fazer cadastro, tente novamente',
        );
      }
    },
    [navigation],
  );

  return (
    <Wrapper>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flex: 1 }}
      >
        <Container>
          <Image source={logoImg} />

          <View>
            <Title>Crie sua conta</Title>
          </View>

          <Form ref={formRef} onSubmit={handleSignUp}>
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
                passwordRef.current?.focus();
              }}
            />

            <Input
              ref={passwordRef}
              secureTextEntry
              textContentType="newPassword"
              name="password"
              icon="lock"
              placeholder="Senha"
              returnKeyType="send"
              onSubmitEditing={() => {
                formRef.current?.submitForm();
              }}
            />

            <Button onPress={() => formRef.current?.submitForm()}>
              Cadastrar
            </Button>
          </Form>
        </Container>
      </ScrollView>

      <BackToSignIn onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" color="#fff" size={20} />
        <BackToSignInText>Voltar para logon</BackToSignInText>
      </BackToSignIn>
    </Wrapper>
  );
};

export default SignUp;
