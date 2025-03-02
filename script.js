// public/script.js
const recipes = {
    top1: { 
        title: "Шоколадный торт", 
        ingredients: [{ name: "Мука", amount: 1000, unit: "г" }, { name: "Сахар", amount: 800, unit: "г" }, { name: "Какао", amount: 200, unit: "г" }], 
        description: "Нежный шоколадный торт с насыщенным вкусом...", 
        steps: [
            "Просейте муку и какао в миску.",
            "Взбейте сахар с яйцами до пышной массы.",
            "Смешайте сухие и влажные ингредиенты, перемешайте.",
            "Выпекайте при 180°C 40 минут."
        ]
    },
    bake1: { 
        title: "Круассаны", 
        ingredients: [{ name: "Мука", amount: 1000, unit: "г" }, { name: "Масло", amount: 500, unit: "г" }, { name: "Сахар", amount: 100, unit: "г" }], 
        description: "Хрустящие французские круассаны...", 
        steps: [
            "Замесите тесто из муки, сахара и воды.",
            "Раскатайте тесто и добавьте слой масла.",
            "Сложите тесто несколько раз и охладите.",
            "Сформируйте круассаны и выпекайте при 200°C 20 минут."
        ]
    },
    dessert1: { 
        title: "Тирамису", 
        ingredients: [{ name: "Маскарпоне", amount: 500, unit: "г" }, { name: "Сливки", amount: 400, unit: "мл" }, { name: "Кофе", amount: 200, unit: "мл" }], 
        description: "Классический итальянский десерт...", 
        steps: [
            "Взбейте сливки с маскарпоне до кремообразной массы.",
            "Обмакните печенье в кофе.",
            "Выложите слоями печенье и крем.",
            "Охладите в холодильнике 4 часа."
        ]
    }
};

let token = localStorage.getItem('token');
if (token) updateProfileButton();

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', () => {
            const recipeId = card.dataset.id;
            showRecipe(recipeId);
        });
    });
});

function showLogin() {
    if (token) {
        showProfile();
    } else {
        document.getElementById('loginModal').style.display = 'block';
    }
}

function closeModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function showRegister() {
    alert('Функция регистрации в разработке');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    alert(data.message);
    if (response.ok) {
        localStorage.setItem('token', data.token);
        token = data.token;
        updateProfileButton();
        closeModal();
    }
});

function updateProfileButton() {
    document.getElementById('profileBtn').textContent = 'Профиль';
}

async function showProfile() {
    const response = await fetch('http://localhost:3000/profile', {
        headers: { 'Authorization': token }
    });
    const data = await response.json();
    if (response.ok) {
        const likedRecipes = data.likes.map(id => `<li>${recipes[id].title} <button onclick="showRecipe('${id}')">Посмотреть</button></li>`).join('');
        document.getElementById('profileInfo').innerHTML = `
            <p><strong>Имя:</strong> ${data.username}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <h3>Понравившиеся рецепты:</h3>
            <ul>${likedRecipes || 'Нет понравившихся рецептов'}</ul>
        `;
        document.getElementById('profileModal').style.display = 'block';
        updateLikes(data.likes);
    } else {
        alert(data.message);
        logout();
    }
}

function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    document.getElementById('profileBtn').textContent = 'Личный кабинет';
    closeProfileModal();
}

async function showRecipe(recipeId) {
    const recipe = recipes[recipeId];
    const content = `
        <h2>${recipe.title}</h2>
        <h3>Ингредиенты:</h3>
        <ul id="ingredientList">
            ${recipe.ingredients.map(ing => `<li data-amount="${ing.amount}">${ing.name}: ${ing.amount} ${ing.unit}</li>`).join('')}
        </ul>
        <h3>Пошаговая инструкция:</h3>
        <ol>
            ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
        <p>${recipe.description}</p>
    `;
    document.getElementById('recipeContent').innerHTML = content;
    
    const likeBtn = document.getElementById('likeBtn');
    likeBtn.dataset.recipeId = recipeId; // Сохраняем ID рецепта
    likeBtn.onclick = () => toggleLike(recipeId);
    
    if (token) {
        const response = await fetch('http://localhost:3000/profile', { headers: { 'Authorization': token } });
        const data = await response.json();
        likeBtn.classList.toggle('liked', data.likes.includes(recipeId));
    } else {
        likeBtn.classList.remove('liked');
    }

    document.getElementById('recipeModal').style.display = 'block';
}

function closeRecipeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

function calculateIngredients() {
    const input = document.getElementById('mainIngredient').value;
    if (!input) return;

    const originalMain = recipes[Object.keys(recipes).find(key => 
        document.getElementById('recipeContent').querySelector('h2').textContent === recipes[key].title
    )].ingredients[0].amount;
    
    const ratio = input / originalMain;
    const list = document.getElementById('ingredientList').children;
    
    for (let item of list) {
        const originalAmount = item.dataset.amount;
        const newAmount = Math.round(originalAmount * ratio);
        item.innerHTML = item.innerHTML.replace(/\d+/, newAmount);
    }
}

async function searchRecipes() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const results = Object.entries(recipes).filter(([_, recipe]) => 
        recipe.title.toLowerCase().includes(query)
    );
    if (results.length > 0) {
        const [recipeId, recipe] = results[0]; // Берем первый результат
        const content = `
            <h2>${recipe.title}</h2>
            <h3>Ингредиенты:</h3>
            <ul id="searchIngredientList">
                ${recipe.ingredients.map(ing => `<li data-amount="${ing.amount}">${ing.name}: ${ing.amount} ${ing.unit}</li>`).join('')}
            </ul>
            <h3>Пошаговая инструкция:</h3>
            <ol>
                ${recipe.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
            <p>${recipe.description}</p>
        `;
        document.getElementById('searchResult').innerHTML = content;

        const likeBtn = document.getElementById('searchLikeBtn');
        likeBtn.dataset.recipeId = recipeId;
        likeBtn.onclick = () => toggleLike(recipeId, true);

        if (token) {
            const response = await fetch('http://localhost:3000/profile', { headers: { 'Authorization': token } });
            const data = await response.json();
            likeBtn.classList.toggle('liked', data.likes.includes(recipeId));
        } else {
            likeBtn.classList.remove('liked');
        }

        document.getElementById('searchModal').style.display = 'block';
    } else {
        alert('Рецепты не найдены');
    }
}

function closeSearchModal() {
    document.getElementById('searchModal').style.display = 'none';
}

function calculateSearchIngredients() {
    const input = document.getElementById('searchMainIngredient').value;
    if (!input) return;

    const originalMain = recipes[Object.keys(recipes).find(key => 
        document.getElementById('searchResult').querySelector('h2').textContent === recipes[key].title
    )].ingredients[0].amount;
    
    const ratio = input / originalMain;
    const list = document.getElementById('searchIngredientList').children;
    
    for (let item of list) {
        const originalAmount = item.dataset.amount;
        const newAmount = Math.round(originalAmount * ratio);
        item.innerHTML = item.innerHTML.replace(/\d+/, newAmount);
    }
}

async function toggleLike(recipeId, isSearch = false) {
    if (!token) {
        alert('Пожалуйста, войдите в аккаунт');
        showLogin();
        return;
    }
    const response = await fetch('http://localhost:3000/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ recipeId })
    });
    const data = await response.json();
    if (response.ok) {
        const btn = isSearch ? document.getElementById('searchLikeBtn') : document.getElementById('likeBtn');
        btn.classList.toggle('liked', data.liked);
    } else {
        alert(data.message);
    }
}

async function updateLikes(likedRecipes) {
    const recipeModal = document.getElementById('recipeModal');
    const searchModal = document.getElementById('searchModal');
    
    if (recipeModal.style.display === 'block') {
        const currentRecipeId = Object.keys(recipes).find(key => 
            document.getElementById('recipeContent').querySelector('h2').textContent === recipes[key].title
        );
        document.getElementById('likeBtn').classList.toggle('liked', likedRecipes.includes(currentRecipeId));
    }
    if (searchModal.style.display === 'block') {
        const currentRecipeId = Object.keys(recipes).find(key => 
            document.getElementById('searchResult').querySelector('h2').textContent === recipes[key].title
        );
        document.getElementById('searchLikeBtn').classList.toggle('liked', likedRecipes.includes(currentRecipeId));
    }
}