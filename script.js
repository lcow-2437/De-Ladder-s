document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products');
    const cartContainer = document.getElementById('cart');
    const totalContainer = document.getElementById('total');
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    const shoppingCart = document.getElementById('shopping-cart');
    const closeCartButton = document.getElementById('close-cart-button');
    const taxRate = 0.13; // 13% tax

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Fetch products from the server
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            populateProductList(products);
            attachAddToCartListeners(products);
        })
        .catch(error => console.error('Error fetching products:', error));

    // Show or hide the cart
    cartButton.addEventListener('click', () => {
        shoppingCart.classList.toggle('visible');
    });

    // Close the cart
    closeCartButton.addEventListener('click', () => {
        shoppingCart.classList.remove('visible');
    });

    // Populate the product list
    function populateProductList(products) {
        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product';
            productElement.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3 class="product-name">${product.name}</h3>
                <p>${product.description}</p>
                <p>Price: $${product.price.toFixed(2)}</p>
                <button data-id="${product.id}">Add to Cart</button>
            `;
            productsContainer.appendChild(productElement);
        });
    }

    // Attach click listeners to "Add to Cart" buttons
    function attachAddToCartListeners(products) {
        document.querySelectorAll('.product button').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                const product = products.find(p => p.id == productId);
                addToCart(product);
                shoppingCart.classList.add('visible'); // Show the cart when an item is added
            });
        });
    }

    // Add a product to the cart
    function addToCart(product) {
        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
    }

    // Update the cart display
    function updateCart() {
        cartContainer.innerHTML = '';
        let total = 0;
        let itemCount = 0;
        cart.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <h3 class="product-name">${item.name}</h3>
                <p>Quantity: ${item.quantity}</p>
                <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                <button data-index="${index}" class="remove-button">Remove</button>
            `;
            cartContainer.appendChild(cartItemElement);
        });

        // Calculate totals including the new tax rate
        const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = subtotal * taxRate;
        const totalWithTax = subtotal + tax;

        totalContainer.innerHTML = `Total (including tax): $${totalWithTax.toFixed(2)}`;
        cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0);

        // Reattach remove button listeners after updating cart
        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }

    // Remove an item from the cart
    function removeFromCart(index) {
        if (cart[index]) {
            cart[index].quantity -= 1;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCart();
        }
    }

    updateCart();
});
