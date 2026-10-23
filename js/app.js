
import { state } from "./state.js";
import { loadAllData } from "./dataService.js";
import {
    renderAll,
    renderOrderDetail
} from "./view.js";

function showError(message) {
    const errorElement = document.querySelector("#error-message");

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove("d-none");
    }

    console.error(message);
}

function hideError() {
    const errorElement = document.querySelector("#error-message");

    if (errorElement) {
        errorElement.textContent = "";
        errorElement.classList.add("d-none");
    }
}

function setupEvents() {
    const searchInput = document.querySelector("#search");
    const statusFilter = document.querySelector("#status-filter");
    const categoryFilter = document.querySelector("#category-filter");
    const ordersContainer = document.querySelector("#orders-container");
    const detailContainer = document.querySelector("#order-detail");

    if (
        !searchInput ||
        !statusFilter ||
        !categoryFilter ||
        !ordersContainer ||
        !detailContainer
    ) {
        throw new Error(
            "Un élément HTML est introuvable. Vérifiez les identifiants dans index.html."
        );
    }

    searchInput.addEventListener("input", (event) => {
        state.search = event.target.value.trim();
        renderAll();
    });

    statusFilter.addEventListener("change", (event) => {
        state.statusFilter = event.target.value;
        renderAll();
    });

    categoryFilter.addEventListener("change", (event) => {
        state.categoryFilter = event.target.value;
        renderAll();
    });

    ordersContainer.addEventListener("click", (event) => {
        const button = event.target.closest("[data-order-id]");

        if (!button) return;

        const orderId = Number(button.dataset.orderId);

        state.selectedOrderId = orderId;
        renderOrderDetail(orderId);
    });

    detailContainer.addEventListener("click", (event) => {
        if (event.target.closest("#close-detail")) {
            detailContainer.innerHTML = "";
            state.selectedOrderId = null;
        }
    });
}

async function init() {
    try {
        hideError();

        const data = await loadAllData();

        state.customers = data.customers;
        state.products = data.products;
        state.orders = data.orders;

        setupEvents();
        renderAll();
    } catch (error) {
        console.error("Erreur d'initialisation :", error);

        showError(
            "Impossible de charger les données. Vérifiez les fichiers JSON et leurs chemins."
        );
    }
}

init();



