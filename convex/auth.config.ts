const authConfig = {
  providers: [
    {
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      // For local testing, fallback to the test Clerk domain
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "workable-dog-93.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

export default authConfig;
