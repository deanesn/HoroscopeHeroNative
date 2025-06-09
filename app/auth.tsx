import React from 'react';
import { NewAuthScreen } from '@/components/AuthScreens/NewAuthScreen';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { Redirect } from 'expo-router';

export default function Auth() {
  const { user } = useAuth();

  // If user is already logged in, redirect to root to determine next step
  if (user) {
    return <Redirect href="/" />;
  }

  return <NewAuthScreen />;
}