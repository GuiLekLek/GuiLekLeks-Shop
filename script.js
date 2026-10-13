
document.addEventListener("DOMContentLoaded", function() {

    // ==================================================
    // ELEMENTOS DO SITE
    // ==================================================

    const continueButton = document.getElementById("continue-button");
    const warning = document.getElementById("language-warning");
    const shop = document.getElementById("shop");

    const navHome = document.getElementById("nav-home");
    const navShop = document.getElementById("nav-shop");
    const navCategories = document.getElementById("nav-categories");

    const homePage = document.getElementById("home-page");
    const shopPage = document.getElementById("shop-page");
    const categoriesPage = document.getElementById("categories-page");
    const cartPage = document.getElementById("cart-page");
    const paymentPage = document.getElementById("payment-page");

    const featuredProducts = document.getElementById("featured-products");
    const products = document.getElementById("products");
    const featuredTimer = document.getElementById("featured-timer");
    const searchInput = document.getElementById("search-input");
    const shopDescription = document.getElementById("shop-description");

    const categoryButtons = document.querySelectorAll(".category-button");

    const cartButton = document.getElementById("cart-button");
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-button");

    // ELEMENTOS DE PAGAMENTO

    const lekcardOption = document.getElementById("lekcard-option");
    const giftcardOption = document.getElementById("giftcard-option");

    const lekcardForm = document.getElementById("lekcard-form");
    const giftcardForm = document.getElementById("giftcard-form");

    const lekcardNumber = document.getElementById("lekcard-number");
    const lekcardSubmit = document.getElementById("lekcard-submit");

    const giftcardCode = document.getElementById("giftcard-code");
    const giftcardCounter = document.getElementById("giftcard-counter");
    const giftcardSubmit = document.getElementById("giftcard-submit");

    const paymentResult = document.getElementById("payment-result");
    const backToCart = document.getElementById("back-to-cart");


    // ==================================================
    // AVISO INICIAL
    // ==================================================

    if (continueButton && warning && shop) {
        continueButton.addEventListener("click", function() {
            warning.style.display = "none";
            shop.style.display = "block";
        });
    }


    // ==================================================
    // CARRINHO
    // ==================================================

    let cart = [];

    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);

            if (!Array.isArray(cart)) {
                cart = [];
            }
        } catch (error) {
            cart = [];
        }
    }

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function updateCartCount() {
        if (!cartCount) return;

        let totalItems = 0;

        cart.forEach(function(item) {
            totalItems += item.quantity;
        });

        cartCount.textContent = totalItems;
    }

    function addProductToCart(button) {
        const productCard = button.closest(".product-card");

        if (!productCard) return;

        const nameElement = productCard.querySelector("h3");

        if (!nameElement) return;

        const name = nameElement.textContent;
        const price = parseFloat(productCard.dataset.price);

        if (Number.isNaN(price)) return;

        const existingProduct = cart.find(function(item) {
            return item.name === name;
        });

        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        saveCart();
        updateCartCount();
    }

    function renderCart() {
        if (!cartItems || !cartTotal) return;

        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = "<p>Seu carrinho está vazio.</p>";
            cartTotal.textContent = "Total: R$ 0.00";
            updateCartCount();
            return;
        }

        let total = 0;

        cart.forEach(function(item, index) {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";

            const nameHeading = document.createElement("h3");
            nameHeading.textContent = item.name;

            const priceText = document.createElement("p");
            priceText.textContent =
                "Preço: R$ " + item.price.toFixed(2);

            const controls = document.createElement("div");
            controls.className = "cart-item-controls";

            const decreaseButton = document.createElement("button");
            decreaseButton.type = "button";
            decreaseButton.textContent = "-";
            decreaseButton.setAttribute("aria-label", "Diminuir quantidade");

            const quantity = document.createElement("span");
            quantity.textContent = item.quantity;

            const increaseButton = document.createElement("button");
            increaseButton.type = "button";
            increaseButton.textContent = "+";
            increaseButton.setAttribute("aria-label", "Aumentar quantidade");

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.textContent = "Remover";

            const subtotal = document.createElement("p");
            subtotal.textContent =
                "Subtotal: R$ " + itemTotal.toFixed(2);

            decreaseButton.addEventListener("click", function() {
                if (cart[index].quantity > 1) {
                    cart[index].quantity--;
                } else {
                    cart.splice(index, 1);
                }

                saveCart();
                renderCart();
            });

            increaseButton.addEventListener("click", function() {
                cart[index].quantity++;
                saveCart();
                renderCart();
            });

            removeButton.addEventListener("click", function() {
                cart.splice(index, 1);
                saveCart();
                renderCart();
            });

            controls.append(
                decreaseButton,
                quantity,
                increaseButton,
                removeButton
            );

            cartItem.append(
                nameHeading,
                priceText,
                controls,
                subtotal
            );

            cartItems.appendChild(cartItem);
        });

        cartTotal.textContent = "Total: R$ " + total.toFixed(2);
        updateCartCount();
    }


    // ==================================================
    // PRODUTOS EM DESTAQUE
    // ==================================================

    function updateFeaturedProducts(forceNew = false) {
        if (!featuredProducts || !products) return;

        const productCards = Array.from(
            products.querySelectorAll(".product-card")
        );

        let selectedIndexes = null;

        if (!forceNew) {
            const savedProducts =
                localStorage.getItem("featuredProducts");

            if (savedProducts) {
                try {
                    selectedIndexes = JSON.parse(savedProducts);
                } catch (error) {
                    selectedIndexes = null;
                }
            }
        }

        const savedIndexesAreValid =
            Array.isArray(selectedIndexes) &&
            selectedIndexes.length === 3 &&
            selectedIndexes.every(function(index) {
                return Number.isInteger(index) &&
                    index >= 0 &&
                    index < productCards.length;
            });

        if (!savedIndexesAreValid || forceNew) {
            const shuffledIndexes = productCards.map(function(_, index) {
                return index;
            });

            shuffledIndexes.sort(function() {
                return Math.random() - 0.5;
            });

            selectedIndexes = shuffledIndexes.slice(0, 3);

            localStorage.setItem(
                "featuredProducts",
                JSON.stringify(selectedIndexes)
            );
        }

        featuredProducts.innerHTML = "";

        selectedIndexes.forEach(function(index) {
            const product = productCards[index];

            if (!product) return;

            const featuredProduct = product.cloneNode(true);
            featuredProducts.appendChild(featuredProduct);

            const featuredButton =
                featuredProduct.querySelector("button");

            if (featuredButton) {
                featuredButton.addEventListener("click", function() {
                    addProductToCart(featuredButton);
                });
            }
        });
    }


    // ==================================================
    // TEMPORIZADOR DOS DESTAQUES
    // ==================================================

    function getNextFeaturedUpdate() {
        const now = new Date();
        const nextUpdate = new Date(now);

        const nextHour = (Math.floor(now.getHours() / 6) + 1) * 6;

        if (nextHour >= 24) {
            nextUpdate.setDate(nextUpdate.getDate() + 1);
            nextUpdate.setHours(0, 0, 0, 0);
        } else {
            nextUpdate.setHours(nextHour, 0, 0, 0);
        }

        return nextUpdate.getTime();
    }

    let nextFeaturedUpdate = getNextFeaturedUpdate();

    function updateFeaturedTimer() {
        if (!featuredTimer) return;

        if (Date.now() >= nextFeaturedUpdate) {
            updateFeaturedProducts(true);
            nextFeaturedUpdate = getNextFeaturedUpdate();
        }

        const totalSeconds = Math.max(
            0,
            Math.floor((nextFeaturedUpdate - Date.now()) / 1000)
        );

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        featuredTimer.textContent =
            "Próxima atualização de produtos em destaque: " +
            String(hours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0");
    }

    updateFeaturedProducts();
    updateFeaturedTimer();

    setInterval(updateFeaturedTimer, 1000);


    // ==================================================
    // SISTEMA DE CATEGORIAS + PESQUISA
    // ==================================================

    let currentCategory = null;

    const categoryNames = {
        placeholder: "Outros",
        informatica: "Informática",
        games: "Games",
        eletronicos: "Eletrônicos",
        casa: "Casa",
        acessorios: "Acessórios",
        roupas: "Roupas",
        papelaria: "Papelaria",
        brinquedos: "Brinquedos",
        esportes: "Esportes"
    };

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    }

    function applyProductFilters() {
        if (!products) return;

        const searchText = searchInput
            ? normalizeText(searchInput.value.trim())
            : "";

        const productCards =
            products.querySelectorAll(".product-card");

        let visibleCount = 0;

        productCards.forEach(function(product) {
            const productCategory = product.dataset.category || "";
            const productText = normalizeText(product.textContent);

            const matchesCategory =
                currentCategory === null ||
                productCategory === currentCategory;

            const matchesSearch =
                productText.includes(searchText);

            const shouldShow = matchesCategory && matchesSearch;

            product.style.display = shouldShow ? "" : "none";

            if (shouldShow) {
                visibleCount++;
            }
        });

        // Mensagem quando nenhum produto corresponde aos filtros

        let emptyMessage = document.getElementById("no-products-message");

        if (!emptyMessage) {
            emptyMessage = document.createElement("p");
            emptyMessage.id = "no-products-message";
            emptyMessage.textContent = "Nenhum produto encontrado.";
            products.insertAdjacentElement("afterend", emptyMessage);
        }

        emptyMessage.style.display = visibleCount === 0 ? "block" : "none";
    }

    function openShopWithCategory(category) {
        currentCategory = category;

        if (searchInput) {
            searchInput.value = "";
        }

        if (shopDescription) {
            if (category === null) {
                shopDescription.textContent =
                    "Todos os produtos do estoque.";
            } else {
                shopDescription.textContent =
                    "Categoria: " + (categoryNames[category] || category);
            }
        }

        applyProductFilters();
        showPage(shopPage);
    }

    // Pesquisa respeita a categoria selecionada

    if (searchInput) {
        searchInput.addEventListener("input", function() {
            applyProductFilters();
        });
    }

    // CADA BOTÃO DE CATEGORIA AGORA É CLICÁVEL!

    categoryButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            const category = button.dataset.category;

            if (!category) return;

            openShopWithCategory(category);
        });
    });


    // ==================================================
    // TROCA DE PÁGINA
    // ==================================================

    function showPage(page) {
        if (!page) return;

        const pages = [
            homePage,
            shopPage,
            categoriesPage,
            cartPage,
            paymentPage
        ];

        pages.forEach(function(currentPage) {
            if (currentPage) {
                currentPage.style.display = "none";
            }
        });

        page.style.display = "block";
    }

    if (navHome) {
        navHome.addEventListener("click", function(event) {
            event.preventDefault();
            showPage(homePage);
        });
    }

    if (navShop) {
        navShop.addEventListener("click", function(event) {
            event.preventDefault();

            // Clicar em Loja mostra todos os produtos novamente
            openShopWithCategory(null);
        });
    }

    if (navCategories) {
        navCategories.addEventListener("click", function(event) {
            event.preventDefault();
            showPage(categoriesPage);
        });
    }


    // ==================================================
    // BOTÕES ADICIONAR AO CARRINHO
    // ==================================================

    if (products) {
        const productButtons =
            products.querySelectorAll(".product-card button");

        productButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                addProductToCart(button);
            });
        });
    }


    // ==================================================
    // ABRIR CARRINHO
    // ==================================================

    if (cartButton) {
        cartButton.addEventListener("click", function() {
            showPage(cartPage);
            renderCart();
        });
    }


    // ==================================================
    // ABRIR CHECKOUT
    // ==================================================

    if (checkoutButton) {
        checkoutButton.addEventListener("click", function() {
            if (cart.length === 0) {
                alert("Seu carrinho está vazio!");
                return;
            }

            if (!paymentPage) {
                alert("A página de pagamento ainda não foi adicionada ao HTML!");
                return;
            }

            if (paymentResult) {
                paymentResult.textContent = "";
            }

            if (lekcardForm) lekcardForm.style.display = "none";
            if (giftcardForm) giftcardForm.style.display = "none";

            showPage(paymentPage);
        });
    }


    // ==================================================
    // ESCOLHER LEKCARD
    // ==================================================

    if (lekcardOption) {
        lekcardOption.addEventListener("click", function() {
            if (lekcardForm) lekcardForm.style.display = "block";
            if (giftcardForm) giftcardForm.style.display = "none";
            if (paymentResult) paymentResult.textContent = "";
        });
    }

    // Aceita somente números no campo LekCard

    if (lekcardNumber) {
        lekcardNumber.addEventListener("input", function() {
            lekcardNumber.value =
                lekcardNumber.value.replace(/\D/g, "");
        });
    }

    // CONFIRMAR LEKCARD

    if (lekcardSubmit) {
        lekcardSubmit.addEventListener("click", function() {
            if (!lekcardNumber || !lekcardNumber.value.trim()) {
                if (paymentResult) {
                    paymentResult.textContent =
                        "Digite um número para seu LekCard!";
                }
                return;
            }

            if (paymentResult) {
                paymentResult.textContent =
                    "✅ Pagamento fictício aprovado! Obrigado por testar a GuiLekLek's Shop!";
            }

            cart = [];
            saveCart();
            updateCartCount();
            renderCart();

            lekcardNumber.value = "";
        });
    }


    // ==================================================
    // ESCOLHER GIFT CARD
    // ==================================================

    if (giftcardOption) {
        giftcardOption.addEventListener("click", function() {
            if (giftcardForm) giftcardForm.style.display = "block";
            if (lekcardForm) lekcardForm.style.display = "none";
            if (paymentResult) paymentResult.textContent = "";
        });
    }

    // CONTADOR DO GIFT CARD

    if (giftcardCode) {
        giftcardCode.addEventListener("input", function() {
            if (giftcardCode.value.length > 25) {
                giftcardCode.value = giftcardCode.value.slice(0, 25);
            }

            if (giftcardCounter) {
                giftcardCounter.textContent =
                    giftcardCode.value.length + "/25 caracteres";
            }
        });
    }

    // CONFIRMAR GIFT CARD

    if (giftcardSubmit) {
        giftcardSubmit.addEventListener("click", function() {
            const code = giftcardCode ? giftcardCode.value : "";

            if (code.length !== 25) {
                if (paymentResult) {
                    paymentResult.textContent =
                        "❌ O código precisa ter exatamente 25 caracteres!";
                }
                return;
            }

            // SIMULAÇÃO: 5% DE CHANCE DE SUCESSO

            if (Math.random() < 0.05) {
                if (paymentResult) {
                    paymentResult.textContent = "Código válido!";
                }

                cart = [];
                saveCart();
                updateCartCount();
                renderCart();

                giftcardCode.value = "";

                if (giftcardCounter) {
                    giftcardCounter.textContent = "0/25 caracteres";
                }
            } else {
                if (paymentResult) {
                    paymentResult.textContent =
                        "Código inválido, tente novamente mais tarde";
                }
            }
        });
    }


    // ==================================================
    // VOLTAR AO CARRINHO
    // ==================================================

    if (backToCart) {
        backToCart.addEventListener("click", function() {
            showPage(cartPage);
            renderCart();
        });
    }


    // ==================================================
    // PRIMEIRA ATUALIZAÇÃO DO CARRINHO
    // ==================================================

    updateCartCount();

});
