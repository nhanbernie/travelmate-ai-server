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
}

export default (): Config => {
  const mongoUri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}`;

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      uri: mongoUri!,
      name: process.env.MONGODB_DATABASE!,
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
  };
};
