namespace NodeJS {
  interface ProcessEnv {
    //Application
    PORT: number;
    //Database
    DB_PORT: number;
    DB_NAME: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_HOST: string;
    API_AUTH_URL: string
    API_PRODUCTS_URL: string
  }
}
