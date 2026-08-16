import React, { createContext, useContext, ReactNode } from 'react';
import { IServiceContainer, defaultContainer } from '../services/container';
import { IKuralRetrievalService } from '../services/interfaces/retrieval-service.interface';
import { ISpeechService } from '../services/interfaces/speech-service.interface';

const ServiceContext = createContext<IServiceContainer>(defaultContainer);

export interface ServiceProviderProps {
  children: ReactNode;
  container?: IServiceContainer;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  container = defaultContainer,
}) => {
  return (
    <ServiceContext.Provider value={container}>
      {children}
    </ServiceContext.Provider>
  );
};

export function useServices(): IServiceContainer {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}

export function useRetrieval(): IKuralRetrievalService {
  return useServices().retrievalService;
}

export function useSpeech(): ISpeechService {
  return useServices().speechService;
}
