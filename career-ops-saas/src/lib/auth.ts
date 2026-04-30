export async function getRequestContext() {
  return {
    userId: "firebase-client",
    workspaceId: "",
    role: "OWNER",
  };
}

export async function getRequestUserId() {
  return "firebase-client";
}

export async function getAuthSession() {
  return {
    user: {
      id: "firebase-client",
      email: "firebase-client@local",
      name: "Firebase User",
      planTier: "FREE",
    },
  };
}
