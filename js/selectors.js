
import { state } from "./state.js";

// Trouver un client par son identifiant
export function getCustomerById(customerId) {
    return state.customers.find(
        customer => customer.id === customerId
    );
}

// Trouver un produit par son identifiant
export function getProductById(productId) {
    return state.products.find(
        product => product.id === productId
    );
}

// Calculer le total d'une ligne de commande
export function calculateLineTotal(item) {
    const product = getProductById(item.productId);

    if (!product) {
        return 0;
    }

    return product.price * item.quantity;
}

// Calculer le total d'une commande
export function calculateOrderTotal(order) {
    return order.items.reduce((total, item) => {
        return total + calculateLineTotal(item);
    }, 0);
}

// Ajouter les informations du client et le total à chaque commande
export function getEnrichedOrders() {
    return state.orders.map(order => {
        const customer = getCustomerById(order.customerId);

        return {
            ...order,
            customer,
            total: calculateOrderTotal(order)
        };
    });
}

// Récupérer les catégories sans répétition
export function getCategories() {
    return [
        ...new Set(
            state.products.map(product => product.category)
        )
    ];
}

// Rechercher et appliquer les filtres
export function getFilteredOrders() {
    return getEnrichedOrders().filter(order => {
        const customerName = order.customer
            ? order.customer.name.toLowerCase()
            : "";

        const matchesSearch = customerName.includes(
            state.search.toLowerCase()
        );

        const matchesStatus =
            !state.statusFilter ||
            order.status === state.statusFilter;

        const matchesCategory =
            !state.categoryFilter ||
            order.items.some(item => {
                const product = getProductById(item.productId);

                return product &&
                    product.category === state.categoryFilter;
            });

        return matchesSearch &&
            matchesStatus &&
            matchesCategory;
    });
}

// Calculer les indicateurs avec forEach
export function getIndicators() {
    const indicators = {
        customers: state.customers.length,
        products: state.products.length,
        orders: state.orders.length,
        revenue: 0
    };

    state.orders.forEach(order => {
        indicators.revenue += calculateOrderTotal(order);
    });

    return indicators;
}

