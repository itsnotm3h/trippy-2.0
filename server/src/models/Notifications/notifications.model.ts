import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/db";

class Notifications extends Model {
  declare notificationId: number;
  declare userId: number;
  declare tripId: number;
  declare type: string;
  declare message: string;
  declare isRead: boolean;
  static associate(models: any) {
    Notifications.belongsTo(models.Trip, { foreignKey: "tripId", as: "trip" });
    Notifications.belongsTo(models.Users, {
      foreignKey: "userId",
      as: "users",
    });
  }
}

Notifications.init(
  {
    notificationId: {
      type: DataTypes.INTEGER,
      field: "notification_id",
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      field: "user_id",
      allowNull: false,
    },
    tripId: {
      type: DataTypes.INTEGER,
      field: "trip_id",
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      field: "is_read",
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "notifications",
    timestamps: true,
    updatedAt: false,
    createdAt: "created_at",
  },
);

export default Notifications;
