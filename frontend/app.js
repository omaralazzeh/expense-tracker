const API_URL = 'http://localhost:3000/api/expenses';

// Fetch and display expenses when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Set today's date by default
    document.getElementById('date').valueAsDate = new Date();
    fetchExpenses();
});

// Function to fetch data from the server
async function fetchExpenses() {
    try {
        const response = await fetch(API_URL);
        const expenses = await response.json();
        
        const tableBody = document.getElementById('expenseTableBody');
        tableBody.innerHTML = '';
        
        let total = 0;

        expenses.forEach(exp => {
            total += parseFloat(exp.amount);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${exp.title}</td>
                <td class="fw-bold text-danger">${parseFloat(exp.amount).toFixed(2)} $</td>
                <td><span class="badge bg-secondary">${exp.category}</span></td>
                <td>${exp.date.split('T')[0]}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteExpense(${exp.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.getElementById('totalAmount').textContent = total.toFixed(2);
    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

// Function to add a new expense
document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newExpense = {
        title: document.getElementById('title').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExpense)
        });

        if (response.ok) {
            document.getElementById('expenseForm').reset();
            document.getElementById('date').valueAsDate = new Date();
            fetchExpenses(); // Refresh table data
        } else {
            alert('Failed to add expense');
        }
    } catch (err) {
        console.error('Error submitting data:', err);
    }
});

// Function to delete an expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchExpenses();
        } else {
            alert('Failed to delete expense');
        }
    } catch (err) {
        console.error('Error deleting data:', err);
    }
}