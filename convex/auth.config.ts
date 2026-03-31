export default {
  providers: [
    {
      // Clerk JWT Issuer domain — set CLERK_JWT_ISSUER_DOMAIN in your Convex dashboard env vars
      // Format: https://<your-clerk-frontend-api> (found in Clerk dashboard → API Keys)
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex", 
    },
  ],
};
