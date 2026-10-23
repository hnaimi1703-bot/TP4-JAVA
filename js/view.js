
import { state } from "./state.js";

import {
    getProductById,
    getFilteredOrders,
    getIndicators,
    calculateLineTotal,
    calculateOrderTotal,
    getCategories
} from "./selectors.js";

const money = amount =>
    new Intl.NumberFormat("fr-MA", {
        style: "currency",
        currency: "MAD",
        maximumFractionDigits: 2
    }).format(amount);

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

const flowerPhotos = [
    "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1494972308805-463bc619d34e?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=700&q=80"
];

export function renderIndicators() {
    const container = document.querySelector("#indicators");
    if (!container) return;

    const indicators = getIndicators();

    container.innerHTML = `
        <div class="col-6 col-lg-3">
            <div class="card indicator-card h-100">
                <div class="indicator-icon">♡</div>
                <p>Nos clients</p>
                <h3>${indicators.customers}</h3>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card indicator-card h-100">
                <div class="indicator-icon">✿</div>
                <p>Nos produits</p>
                <h3>${indicators.products}</h3>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card indicator-card h-100">
                <div class="indicator-icon">♧</div>
                <p>Commandes</p>
                <h3>${indicators.orders}</h3>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card indicator-card h-100">
                <div class="indicator-icon">♡</div>
                <p>Montant total</p>
                <h3 class="indicator-total">${money(indicators.revenue)}</h3>
            </div>
        </div>
    `;
}

export function renderCategories() {
    const select = document.querySelector("#category-filter");
    if (!select) return;

    const previousValue = state.categoryFilter;

    select.innerHTML = `
        <option value="">Toutes les catégories</option>
        ${getCategories().map(category => `
            <option value="${escapeHTML(category)}">
                ${escapeHTML(category)}
            </option>
        `).join("")}
    `;

    select.value = previousValue;
}

export function renderProducts() {
    let section = document.querySelector("#products-section");

    if (!section) {
        section = document.createElement("section");
        section.id = "products-section";
        section.className = "container-fluid mt-5 mb-4";

        section.innerHTML = `
            <div class="mb-4">
                <p class="text-uppercase text-muted mb-1">
                    FLEURS ÉLÉGANCE
                </p>
                <h2>Notre collection de fleurs 🌸</h2>
                <p>Découvrez nos bouquets et nos fleurs préférées.</p>
            </div>
            <div class="row g-4" id="products-container"></div>
        `;

        const indicators = document.querySelector("#indicators");

        if (indicators) {
            indicators.insertAdjacentElement("afterend", section);
        } else {
            const main = document.querySelector("main") ||
                document.body;

            main.appendChild(section);
        }
    }

    const container = section.querySelector("#products-container");
    if (!container) return;

    container.innerHTML = state.products.map((product, index) => `
        <div class="col-6 col-md-4 col-xl-3">
            <article class="card h-100 border-0 shadow-sm overflow-hidden">
                <img
                    src="${flowerPhotos[index % flowerPhotos.length]}"
                    alt="${escapeHTML(product.name)}"
                    class="w-100"
                    style="height:220px;object-fit:cover"
                    loading="lazy"
                    onerror="this.style.display='none'"
                >
                <div class="card-body">
                    <span class="badge text-bg-light mb-2">
                        ${escapeHTML(product.category)}
                    </span>
                    <h5 class="card-title">
                        ${escapeHTML(product.name)}
                    </h5>
                    <p class="fs-5 fw-bold mb-1">
                        ${money(product.price)}
                    </p>
                    <p class="text-muted mb-0">
                        Stock disponible : ${product.stock}
                    </p>
                </div>
            </article>
        </div>
    `).join("");
}

export function renderOrders() {
    const container = document.querySelector("#orders-container");
    if (!container) return;

    const orders = getFilteredOrders();

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="card empty-state text-center p-5">
                <div class="empty-flower">❀</div>
                <h3>Aucune commande trouvée</h3>
                <p>Essayez de modifier la recherche ou les filtres.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row g-4">
            ${orders.map(order => `
                <div class="col-12 col-md-6 col-xl-4">
                    <article class="card order-card h-100">
                        <div class="order-card-top">
                            <span class="order-reference">
                                COMMANDE #${order.id}
                            </span>
                            <span class="status-badge status-${statusClass(order.status)}">
                                ${escapeHTML(statusLabel(order.status))}
                            </span>
                        </div>

                        <div class="order-flower">✿</div>

                        <h3>
                            ${escapeHTML(order.customer?.name || "Client inconnu")}
                        </h3>

                        <p class="order-city">
                            ♡ ${escapeHTML(order.customer?.city || "Ville inconnue")}
                        </p>

                        <div class="order-info">
                            <span>Date</span>
                            <strong>${escapeHTML(order.date)}</strong>
                        </div>

                        <div class="order-info">
                            <span>Articles</span>
                            <strong>${order.items.reduce(
                                (sum, item) => sum + item.quantity, 0
                            )}</strong>
                        </div>

                        <div class="order-total">
                            <span>Total de la commande</span>
                            <strong>${money(order.total)}</strong>
                        </div>

                        <button
                            class="btn btn-primary w-100 mt-3"
                            data-order-id="${order.id}"
                            type="button"
                        >
                            Voir les détails ♡
                        </button>
                    </article>
                </div>
            `).join("")}
        </div>
    `;
}

function statusLabel(status) {
    const labels = {
        Livree: "Livrée",
        "En attente": "En attente",
        Annulee: "Annulée"
    };

    return labels[status] || status;
}

function statusClass(status) {
    const classes = {
        Livree: "delivered",
        "En attente": "pending",
        Annulee: "cancelled"
    };

    return classes[status] || "pending";
}

export function renderOrderDetail(orderId) {
    const container = document.querySelector("#order-detail");
    if (!container) return;

    const order = state.orders.find(
        item => item.id === Number(orderId)
    );

    if (!order) {
        container.innerHTML = "";
        return;
    }

    const customer = state.customers.find(
        item => item.id === order.customerId
    );

    container.innerHTML = `
        <div class="card detail-card">
            <div class="detail-heading">
                <div>
                    <p class="detail-eyebrow">FLEURS ÉLÉGANCE</p>
                    <h2>Détails de la commande #${order.id}</h2>
                    <p>${escapeHTML(order.date)}</p>
                </div>

                <button
                    id="close-detail"
                    class="btn btn-outline-secondary"
                    type="button"
                >
                    Fermer ✕
                </button>
            </div>

            <div class="customer-detail">
                <h3>Informations du client</h3>
                <p><strong>Nom :</strong>
                    ${escapeHTML(customer?.name || "Client inconnu")}
                </p>
                <p><strong>Ville :</strong>
                    ${escapeHTML(customer?.city || "Ville inconnue")}
                </p>
                <p><strong>Statut :</strong>
                    ${escapeHTML(statusLabel(order.status))}
                </p>
            </div>

            <h3 class="mt-4">Articles commandés</h3>

            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th>Prix unitaire</th>
                            <th>Quantité</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => {
                            const product = getProductById(item.productId);

                            if (!product) {
                                return `
                                    <tr>
                                        <td colspan="4">Produit introuvable</td>
                                    </tr>
                                `;
                            }

                            return `
                                <tr>
                                    <td>${escapeHTML(product.name)}</td>
                                    <td>${money(product.price)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${money(calculateLineTotal(item))}</td>
                                </tr>
                            `;
                        }).join("")}
                    </tbody>
                </table>
            </div>

            <div class="detail-total">
                Total de la commande :
                <strong>${money(calculateOrderTotal(order))}</strong>
            </div>
        </div>
    `;

    container.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

export function renderAll() {
    renderIndicators();
    renderCategories();
    renderProducts();
    renderOrders();
}

