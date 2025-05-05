const recipes = {
    'Chicken Parmesan': {
        description: 'A crispy breaded chicken cutlet topped with marinara sauce and melted cheese.',
        ingredients: [
            { name: 'Chicken breast', qty: 500 },
            { name: 'Breadcrumbs', qty: 200 },
            { name: 'Marinara sauce', qty: 300 },
            { name: 'Mozzarella cheese', qty: 150 }
        ],
        steps: [
            'Pound the chicken breasts to an even thickness.',
            'Coat the chicken in breadcrumbs and fry until golden.',
            'Top with marinara sauce and mozzarella, then bake until the cheese melts.'
        ]
    },
    'Lasagna': {
        description: 'Layers of pasta with rich meat sauce and creamy cheese.',
        ingredients: [
            { name: 'Lasagna noodles', qty: 400 },
            { name: 'Ground beef', qty: 600 },
            { name: 'Ricotta cheese', qty: 300 },
            { name: 'Tomato sauce', qty: 500 }
        ],
        steps: [
            'Cook the lasagna noodles until al dente.',
            'Brown the ground beef and mix with tomato sauce.',
            'Layer noodles, beef mixture, and ricotta cheese, then bake until bubbly.'
        ]
    },
    'Sushi Rolls': {
        description: 'Fresh sushi rolls with rice, fish, and vegetables.',
        ingredients: [
            { name: 'Sushi rice', qty: 300 },
            { name: 'Salmon', qty: 200 },
            { name: 'Avocado', qty: 100 },
            { name: 'Nori sheets', qty: 50 }
        ],
        steps: [
            'Cook and season the sushi rice.',
            'Place nori on a bamboo mat, spread rice, and add salmon and avocado.',
            'Roll tightly, slice, and serve with soy sauce.'
        ]
    },
    'Fruit Tart': {
        description: 'A sweet pastry crust filled with custard and topped with fresh fruits.',
        ingredients: [
            { name: 'Flour', qty: 200 },
            { name: 'Butter', qty: 100 },
            { name: 'Custard', qty: 300 },
            { name: 'Mixed fruits', qty: 400 }
        ],
        steps: [
            'Make the pastry dough with flour and butter, then bake the crust.',
            'Prepare the custard and fill the cooled crust.',
            'Arrange mixed fruits on top and chill before serving.'
        ]
    },
    'Beef Stew': {
        description: 'A hearty stew with tender beef and vegetables.',
        ingredients: [
            { name: 'Beef chunks', qty: 600 },
            { name: 'Potatoes', qty: 400 },
            { name: 'Carrots', qty: 200 },
            { name: 'Beef broth', qty: 500 }
        ],
        steps: [
            'Brown the beef chunks in a pot.',
            'Add potatoes, carrots, and beef broth.',
            'Simmer for 2 hours until the beef is tender.'
        ]
    },
    'Pasta Carbonara': {
        description: 'A creamy pasta dish with eggs, cheese, and pancetta.',
        ingredients: [
            { name: 'Spaghetti', qty: 400 },
            { name: 'Pancetta', qty: 150 },
            { name: 'Eggs', qty: 100 },
            { name: 'Parmesan cheese', qty: 100 }
        ],
        steps: [
            'Cook spaghetti until al dente.',
            'Fry pancetta until crispy.',
            'Mix eggs and cheese, toss with pasta and pancetta, and serve immediately.'
        ]
    },
    'Ceviche': {
        description: 'Fresh fish marinated in citrus juices with herbs.',
        ingredients: [
            { name: 'White fish', qty: 400 },
            { name: 'Lime juice', qty: 200 },
            { name: 'Cilantro', qty: 50 },
            { name: 'Red onion', qty: 100 }
        ],
        steps: [
            'Dice the fish and marinate in lime juice for 30 minutes.',
            'Mix with chopped cilantro and red onion.',
            'Serve chilled with tortilla chips.'
        ]
    },
    'Chocolate Cake': {
        description: 'A rich and moist chocolate cake with frosting.',
        ingredients: [
            { name: 'Flour', qty: 250 },
            { name: 'Cocoa powder', qty: 100 },
            { name: 'Sugar', qty: 300 },
            { name: 'Butter', qty: 200 }
        ],
        steps: [
            'Mix flour, cocoa powder, and sugar with melted butter.',
            'Bake at 350°F for 30 minutes.',
            'Cool and frost with chocolate frosting.'
        ]
    }
};

function openModal(type) {
    let modal;
    if (type === 'login') {
        modal = document.getElementById('loginModal');
    } else if (type === 'signup') {
        modal = document.getElementById('signupModal');
    } else {
        modal = document.getElementById('recipeModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalImage = document.getElementById('modalImage');
        const modalDescription = document.getElementById('modalDescription');
        const ingredientList = document.getElementById('ingredientList');
        const cookingSteps = document.getElementById('cookingSteps');

        modalTitle.textContent = type;
        modalImage.src = document.querySelector(`img[alt="${type}"]`).src;
        const recipe = recipes[type];
        modalDescription.textContent = recipe.description;

        ingredientList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const div = document.createElement('div');
            div.innerHTML = `<span>${ingredient.name}</span><input type="number" class="ingredient-qty" value="${ingredient.qty}" min="0" data-original="${ingredient.qty}">`;
            ingredientList.appendChild(div);
        });

        cookingSteps.innerHTML = '';
        recipe.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            cookingSteps.appendChild(li);
        });
    }
    modal.style.display = 'flex';

    document.querySelectorAll('.ingredient-qty')?.forEach(input => {
        input.addEventListener('input', updateIngredients);
    });
}

function closeModal(type) {
    let modal;
    if (type === 'login') {
        modal = document.getElementById('loginModal');
    } else if (type === 'signup') {
        modal = document.getElementById('signupModal');
    } else {
        modal = document.getElementById('recipeModal');
    }
    modal.style.display = 'none';
}

function updateIngredients(event) {
    const inputs = document.querySelectorAll('.ingredient-qty');
    const changedInput = event.target;
    const newValue = parseFloat(changedInput.value);
    const originalValue = parseFloat(changedInput.getAttribute('data-original'));

    if (isNaN(newValue) || newValue <= 0) {
        inputs.forEach(input => input.value = input.getAttribute('data-original'));
        return;
    }

    const ratio = newValue / originalValue;

    inputs.forEach(input => {
        if (input !== changedInput) {
            const originalQty = parseFloat(input.getAttribute('data-original'));
            const newQty = originalQty * ratio;
            input.value = Math.round(newQty);
        }
    });
}

window.addEventListener('scroll', function() {
    const mouseImage = document.querySelector('.mouse-image');
    const section1 = document.querySelector('.section-1');
    const section1Bottom = section1.getBoundingClientRect().bottom;
    const section2Top = document.querySelector('.section-2').getBoundingClientRect().top;

    if (section1Bottom <= 0 && section2Top <= window.innerHeight) {
        mouseImage.classList.add('sticky');
    } else if (section1Bottom > 0) {
        mouseImage.classList.remove('sticky');
    }
});