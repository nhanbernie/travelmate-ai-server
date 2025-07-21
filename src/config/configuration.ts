interface Config {
  port: number;
  database: {
    uri: string;
    name: string;
  };
  jwt: {
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
  };
  email: {
    user: string;
    password: string;
  };
  openrouter: {
    apiKey: string;
    baseUrl: string;
    siteUrl: string;
    siteName: string;
  };
}

export default (): Config => {
  // Auto detect environment and choose appropriate MongoDB URI
  const isProduction = process.env.NODE_ENV === 'production';

  let mongoUri: string;

  if (isProduction || process.env.MONGODB_USERNAME) {
    mongoUri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
  } else {
    mongoUri = `${process.env.MONGODB_URI}${process.env.MONGODB_DATABASE}`;
  }

  return {
    port: parseInt(process.env.PORT || '3333', 10),
    database: {
      uri: mongoUri!,
      name: process.env.MONGODB_DATABASE!,
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN!,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
    },
    email: {
      user: process.env.GMAIL_USER!,
      password: process.env.GMAIL_APP_PASSWORD!,
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY!,
      baseUrl:
        process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      siteUrl: process.env.OPENROUTER_SITE_URL || 'http://localhost:3333',
      siteName: process.env.OPENROUTER_SITE_NAME || 'TravelMate AI',
    },
  };
};
