import { Model, DataTypes, DecimalDataType } from "sequelize";
import sequelize from "../../config/db";

class Trip extends Model {
  declare tripId: number;
  declare title: string;
  declare type: string;
  declare country: string;
  declare currencyRate: DecimalDataType;
  declare startDate: Date;
  declare endDate: Date;
  declare leaderId: number;
  declare isActive: boolean;
  declare isDeleted: boolean;
  static associate(models: any) {
    Trip.hasMany(models.Expenses, { foreignKey: "tripId", as: "expenses" });
    Trip.belongsTo(models.Users, {
      foreignKey: "leaderId",
      targetKey: "userId",
      as: "users",
    });
    Trip.hasMany(models.Notifications, {
      foreignKey: "tripId",
      as: "notifications",
    });
    Trip.hasMany(models.PersonalBudget, {
      foreignKey: "tripId",
      as: "personalBudget",
    });
    Trip.hasMany(models.Settlements, {
      foreignKey: "tripId",
      as: "settlements",
    });
    Trip.belongsToMany(models.Users, {
      through: models.TripMembers,
      foreignKey: "tripId",
      otherKey: "userId",
      as: "members",
    });
  }
}

Trip.init(
  {
    tripId: {
      type: DataTypes.INTEGER,
      field: "trip_id",
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currencyRate: {
      type: DataTypes.DECIMAL(10, 2),
      field: "currency_rate",
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      field: "start_date",
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      field: "end_date",
      allowNull: false,
    },
    leaderId: {
      type: DataTypes.NUMBER,
      field: "leader_id",
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: "is_active",
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      field: "is_deleted",
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "trips",
    timestamps: true,
    updatedAt: false,
    createdAt: "createdAt",
    underscored: true,
  },
);
export default Trip;
