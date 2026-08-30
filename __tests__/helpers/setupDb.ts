import { sequelize } from "@/models";

export const setupDb = async (): Promise<void> => {
  await sequelize.sync({ force: true });
};

export const teardownDb = async (): Promise<void> => {
  await sequelize.close();
};