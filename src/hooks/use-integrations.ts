import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from "@tanstack/react-query";
import {
  connectLinear,
  disconnectIntegration,
  getIntegrations,
  verifyIntegration,
  type ConnectLinearResponse,
  type IntegrationProviderKey,
  type IntegrationsListResponse,
  type VerifyIntegrationResponse,
} from "@/api/integrations.api";

export const integrationKeys = {
  all: ["integrations"] as const,
  list: () => [...integrationKeys.all, "list"] as const,
};

export function useIntegrations(
  options?: Omit<UseQueryOptions<IntegrationsListResponse, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: integrationKeys.list(),
    queryFn: () => getIntegrations(),
    ...options,
  });
}

export function useConnectLinear(
  options?: UseMutationOptions<ConnectLinearResponse, Error, { pat: string }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ pat }) => connectLinear(pat),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDisconnectIntegration(
  options?: UseMutationOptions<{ disconnected: boolean; provider: string }, Error, { provider: IntegrationProviderKey }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ provider }) => disconnectIntegration(provider),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useVerifyIntegration(
  options?: UseMutationOptions<VerifyIntegrationResponse, Error, { provider: IntegrationProviderKey }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...rest } = options ?? {};
  return useMutation({
    ...rest,
    mutationFn: ({ provider }) => verifyIntegration(provider),
    onSuccess: (data, variables, onMutateResult, context) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.list() });
      onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
