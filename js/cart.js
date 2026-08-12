$(document).ready(function () {
    let cart = [];
    try {
        cart = JSON.parse(localStorage.getItem('shoppingCart'));
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        cart = [];
    }
    
    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    function formatCurrency(amount) {
        return '$ ' + amount.toFixed(2);
    }

    function updateCartHeader() {
        let totalItems = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        $('.header__nav__option a img[src*="cart.png"]').closest('a').find('span').text(totalItems);
        $('.offcanvas__nav__option a img[src*="cart.png"]').closest('a').find('span').text(totalItems);
        
        $('.header__nav__option .price').text(formatCurrency(totalPrice));
        $('.offcanvas__nav__option .price').text(formatCurrency(totalPrice));
        
        $('.cart__total ul li span').text(formatCurrency(totalPrice));
    }

    updateCartHeader();

    $('.add-cart').on('click', function (e) {
        e.preventDefault();
        let $product = $(this).closest('.product__item');
        let name = $product.find('h6').text().trim();
        let priceText = $product.find('h5').text().replace('$', '').trim();
        let price = parseFloat(priceText);
        let imageSrc = 'img/product/product-1.jpg';
        
        let $pic = $product.find('.product__item__pic');
        if ($pic.length) {
            let bg = $pic.css('background-image');
            if (bg && bg !== 'none') {
                imageSrc = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            } else if ($pic.attr('data-setbg')) {
                imageSrc = $pic.attr('data-setbg');
            }
        }

        if (isNaN(price)) return;

        let existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name: name, price: price, image: imageSrc, quantity: 1 });
        }

        saveCart();
        updateCartHeader();
        
        let originalText = $(this).text();
        $(this).text('Added to Cart!');
        setTimeout(() => { $(this).text(originalText); }, 1500);
    });

    function renderShoppingCart() {
        let $cartTableBody = $('.shopping__cart__table tbody');
        if ($cartTableBody.length === 0) return;

        $cartTableBody.empty();

        if (cart.length === 0) {
            $cartTableBody.append('<tr><td colspan="4" class="text-center py-4" style="text-align:center; padding:50px;">Your cart is empty.</td></tr>');
            return;
        }

        cart.forEach((item, index) => {
            let totalItemPrice = item.price * item.quantity;
            let row = `
                <tr data-index="${index}">
                    <td class="product__cart__item">
                        <div class="product__cart__item__pic">
                            <img src="${item.image}" alt="Image" style="width: 90px; height: 90px; object-fit: cover;">
                        </div>
                        <div class="product__cart__item__text">
                            <h6>${item.name}</h6>
                            <h5>${formatCurrency(item.price)}</h5>
                        </div>
                    </td>
                    <td class="quantity__item">
                        <div class="quantity">
                            <div class="pro-qty-2">
                                <span class="fa fa-angle-left dec qtybtn"></span>
                                <input type="text" value="${item.quantity}">
                                <span class="fa fa-angle-right inc qtybtn"></span>
                            </div>
                        </div>
                    </td>
                    <td class="cart__price">${formatCurrency(totalItemPrice)}</td>
                    <td class="cart__close"><i class="fa fa-close remove-item" style="cursor:pointer; font-size:20px; color:#111;"></i></td>
                </tr>
            `;
            $cartTableBody.append(row);
        });

        // Re-attach qtybtn events for dynamic content
        $('.pro-qty-2 .qtybtn').off('click').on('click', function () {
            let $button = $(this);
            let $input = $button.parent().find('input');
            let oldValue = parseFloat($input.val());
            let newVal = 0;
            
            if ($button.hasClass('inc')) {
                newVal = oldValue + 1;
            } else {
                newVal = oldValue > 1 ? oldValue - 1 : 1;
            }
            $input.val(newVal);
            
            let $row = $button.closest('tr');
            let index = $row.attr('data-index');
            cart[index].quantity = newVal;
            
            saveCart();
            renderShoppingCart();
            updateCartHeader();
        });
    }

    renderShoppingCart();

    $(document).on('click', '.remove-item', function () {
        let index = $(this).closest('tr').attr('data-index');
        if (index !== undefined) {
            cart.splice(index, 1);
            saveCart();
            renderShoppingCart();
            updateCartHeader();
        }
    });
});
