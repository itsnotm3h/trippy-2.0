import sequelize from "../config/db"; // Your sequelize instance

// 1. Import your Model Classes
import Users from "./User/users.model";
import Expenses from "./Expenses/expenses.model";
import ExpenseShare from "./ExpenseShare/expenseShare.model";
import PersonalBudget from "./personalBudget.model";
import Settlements from "./settlements.model";
import Notifications from "./Notifications/notifications.model";
import Trip from "./Trips/trip.model";
import TripMembers from "./TripMembers/tripMembers.model";

// 2. Put them in an object for easy access
const models: any = {
  Trip,
  Users,
  TripMembers,
  Expenses,
  ExpenseShare,
  Notifications,
  PersonalBudget,
  Settlements,
};

// 3. Run the "associate" check
// This is the magic part that prevents the EagerLoadingError
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    console.log(`Linking associations for: ${modelName}`);
    models[modelName].associate(models);
  }
});

export {
  sequelize,
  Users,
  Trip,
  TripMembers,
  Expenses,
  ExpenseShare,
  Notifications,
  PersonalBudget,
  Settlements,
};
export default models;
