import { prisma } from "./context";

type Policy = {
  id: number;
  client_policy: object[];
};

export const findPolicyWithLeastObjects = async () => {
  const avaliableAgents = await prisma.users.findMany({
    where: {
      employeeInfo: {
        isAgent: true,
      },
    },
    select: {
      id: true,
      client_policy: {
        select: {
          id: true,
        },
      },
    },
  });

  if (avaliableAgents.length === 0) return null;
  let minPolicy = avaliableAgents[0];
  for (let i = 1; i < avaliableAgents.length; i++) {
    if (
      avaliableAgents[i].client_policy.length < minPolicy.client_policy.length
    ) {
      minPolicy = avaliableAgents[i];
    }
  }

  return minPolicy.id;
};
