interface Config {
  port: number;
  database: {
    uri: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
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
      expiresIn: process.env.JWT_EXPIRES_IN!,
    },
  };
};
