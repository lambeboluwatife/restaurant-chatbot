let sessions = {};

const menu = [
  { id: 1, name: "Jollof Rice with Chicken", price: "N3000" },
  { id: 2, name: "Fried Rice with Chicken", price: "N3500" },
  { id: 3, name: "Yam and Scrambled Egg", price: "N2500" },
  { id: 4, name: "Spaghetti with Turkey", price: "N2500" },
  { id: 5, name: "Bread and Beans with Boiled Egg", price: "N2000" },
];

let level = 0;

function userOrderInputs(input, sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = { currentOrder: [], orderHistory: [] };
  }

  switch (input) {
    case "96":
      level += 1;
      return `
        ${menu
          .map((item) => `<h6>${item.id}. ${item.name} - ${item.price}</h6>`)
          .join("\n")}
        `;
    case "99":
      if (sessions[sessionId].currentOrder.length > 0) {
        sessions[sessionId].orderHistory.push([
          ...sessions[sessionId].currentOrder,
        ]);
        sessions[sessionId].currentOrder = [];
        level = 0;
        return "Order placed. You can start a new order by selecting 96.";
      } else {
        return "No order to place.";
      }
    case "98":
      return (
        "Order History:\n" +
        (sessions[sessionId].orderHistory.length > 0
          ? sessions[sessionId].orderHistory
              .map(
                (order, index) =>
                  `Order ${index + 1}: ${order
                    .map((item) => item.name)
                    .join(", ")}`
              )
              .join("\n")
          : "No order history.")
      );
    case "97":
      return (
        "Current Order:\n" +
        (sessions[sessionId].currentOrder.length > 0
          ? sessions[sessionId].currentOrder.map((item) => item.name).join(", ")
          : "No current order.")
      );
    case "0":
      if (sessions[sessionId].currentOrder.length > 0) {
        sessions[sessionId].currentOrder = [];
        return "Order cancelled.";
      } else {
        return "No order to cancel.";
      }
    default:
      const item = menu.find((item) => item.id === parseInt(input));
      if (item && level !== 0) {
        sessions[sessionId].currentOrder.push(item);
        return `${item.name} added to your order. Add more items or select 99 to checkout.`;
      } else {
        return "Invalid selection. Please choose a valid option.";
      }
  }
}

module.exports = userOrderInputs;
