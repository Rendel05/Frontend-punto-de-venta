const dashboardTemplate = `
    <div class="container-fluid py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="h4 fw-bold">Panel de Crecimiento de Clientes</h2>
            <div id="loading-spinner" class="spinner-border text-primary spinner-border-sm" role="status" style="display: none;"></div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-md-4">
                <div class="card border-0 shadow-sm p-3">
                    <span class="text-muted small fw-bold">TOTAL DE CLIENTES</span>
                    <h2 id="kpi-total" class="text-primary mb-0">--</h2>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm p-3">
                    <span class="text-muted small fw-bold">PRIMER REGISTRO</span>
                    <h2 id="kpi-first" class="text-success mb-0">--</h2>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-0 shadow-sm p-3">
                    <span class="text-muted small fw-bold">ÚLTIMO REGISTRO</span>
                    <h2 id="kpi-last" class="text-warning mb-0">--</h2>
                </div>
            </div>
        </div>

        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card border-0 shadow-sm p-4 h-100">
                    <h5 class="card-title mb-4">Análisis de Crecimiento de Clientes</h5>
                    <div style="position: relative; height: 400px;">
                        <canvas id="prediction-chart"></canvas>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card border-0 shadow-sm p-4">
                    <h5 class="card-title mb-3">Configuración de Predicción</h5>
                    <p class="text-muted small">Selecciona un mes objetivo para proyectar el crecimiento usando el modelo exponencial.</p>
                    
                    <div class="mb-3">
                        <label class="form-label small">Mes objetivo</label>
                        <input type="month" id="target-date" class="form-control">
                    </div>

                    <button id="calculate-btn" class="btn btn-primary w-100 py-2 fw-bold">
                        Calcular predicción
                    </button>

                    <div id="model-details" class="mt-4 p-3 bg-light rounded border-start border-4 border-primary" style="display:none;">
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

let predictionChartInstance = null;

async function initDashboard() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = dashboardTemplate;

    const token = localStorage.getItem('token');
    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const dateInput = document.getElementById('target-date');
    const calculateBtn = document.getElementById('calculate-btn');
    const spinner = document.getElementById('loading-spinner');

    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() + 1);
    dateInput.value = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}`;

    try {
        spinner.style.display = 'inline-block';
        const response = await fetch(`${API_BASE}/prediction/resumen`, { 
            headers: authHeaders 
        });
        
        const data = await response.json();

        if (response.ok) {
            document.getElementById('kpi-total').innerText = data.total.toLocaleString();
            document.getElementById('kpi-first').innerText = data.historico?.[0]?.month || '--';
            document.getElementById('kpi-last').innerText = data.historico.at(-1)?.month || '--';
            
            renderChart(data.historico, []);
        }
    } catch (error) {
        console.error('Summary Fetch Error:', error);
    } finally {
        spinner.style.display = 'none';
    }

    calculateBtn.addEventListener('click', async () => {
        const targetDate = dateInput.value;
        if (!targetDate) return;

        try {
            calculateBtn.disabled = true;
            spinner.style.display = 'inline-block';

            const response = await fetch(`${API_BASE}/prediction`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ fechaObjetivo: targetDate })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            renderChart(result.historico, result.proyeccion);
            updateModelInfo(result.modelo);

        } catch (err) {
            alert('Error en la predicción: ' + err.message);
        } finally {
            calculateBtn.disabled = false;
            spinner.style.display = 'none';
        }
    });
}

function renderChart(history, projection) {
    const ctx = document.getElementById('prediction-chart').getContext('2d');
    if (predictionChartInstance) predictionChartInstance.destroy();

    const labels = [
        ...history.map(h => h.month || h.mes), 
        ...projection.map(p => p.mes)
    ];
    
    const actualData = history.map(h => h.total || h.N);
    
    const projectedData = [
        ...new Array(actualData.length - 1).fill(null),
        actualData.at(-1),
        ...projection.map(p => p.Nt)
    ];

    predictionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Crecimiento real',
                    data: actualData,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Crecimiento proyectado',
                    data: projectedData,
                    borderColor: '#ea580c',
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function updateModelInfo(model) {
    const infoBox = document.getElementById('model-details');
    infoBox.style.display = 'block';
    infoBox.innerHTML = `
        <p class="mb-1 fw-bold small text-primary">MODELO EXPONENCIAL</p>
        <code class="d-block mb-2 text-dark">N(t) = ${model.N0} * e^(${model.k} * t)</code>
        <p class="mb-0 small text-muted">Crecimiento estimado: <strong>${model.tasaMensual}</strong> mensual.</p>
    `;
}