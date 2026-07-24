document.addEventListener('DOMContentLoaded', () => {
            // Conta el número original de tarjetas
            const TOTAL_PREGUNTAS_INICIALES = document.querySelectorAll('#quiz-form > .question-card').length;
            let aciertosPrimerIntento = 0;
            let preguntasRespondidasOriginales = 0;

            const formularioQuiz = document.getElementById('quiz-form');
            const cajaResultado = document.getElementById('result-box');
            const contenedorReintentos = document.getElementById('retry-container');
            const tituloReintentos = document.getElementById('retry-title');
            const cajaDocumentacionQA = document.getElementById('qa-documentation-box');

            formularioQuiz.addEventListener('change', function (evento) {
                const elementoActivo = evento.target;

                if (elementoActivo && elementoActivo.type === 'radio') {
                    const opcionSeleccionada = elementoActivo;
                    const nombreGrupo = opcionSeleccionada.name;
                    const esUnReintento = opcionSeleccionada.closest('#retry-container') !== null;
                    const todasLasOpciones = formularioQuiz.querySelectorAll(`input[name="${nombreGrupo}"]`);

                    // 1. Validar e inhabilitar grupo de opciones
                    todasLasOpciones.forEach(opcion => {
                        const contenedorOpcion = opcion.parentElement;
                        if (opcion.value === 'correct') {
                            contenedorOpcion.classList.add('correct-answer');
                        }
                        opcion.disabled = true;
                        contenedorOpcion.style.cursor = 'not-allowed';
                    });

                    // 2. Evaluacion y Logica de Segunda Oportunidad
                    if (opcionSeleccionada.value === 'correct') {
                        if (!esUnReintento) {
                            aciertosPrimerIntento++;
                            preguntasRespondidasOriginales++;
                        }
                    } else {
                        opcionSeleccionada.parentElement.classList.add('incorrect-answer');

                        if (!esUnReintento) {
                            preguntasRespondidasOriginales++;
                            const tarjetaOriginal = opcionSeleccionada.closest('.question-card');

                            setTimeout(() => {
                                tarjetaOriginal.classList.add('fade-out');

                                setTimeout(() => {
                                    const tarjetaClonada = tarjetaOriginal.cloneNode(true);
                                    tarjetaClonada.classList.remove('fade-out');

                                    const inputsClonados = tarjetaClonada.querySelectorAll('input[type="radio"]');
                                    const divsOpciones = tarjetaClonada.querySelectorAll('.option-item');

                                    inputsClonados.forEach(input => {
                                        const viejoId = input.id;
                                        input.name = nombreGrupo + '_retry';
                                        input.checked = false;
                                        input.disabled = false;
                                        input.id = viejoId + '_retry';
                                        tarjetaClonada.querySelector(`label[for="${viejoId}"]`).setAttribute('for', input.id);
                                    });

                                    divsOpciones.forEach(div => {
                                        div.classList.remove('correct-answer', 'incorrect-answer');
                                        div.style.cursor = 'pointer';
                                    });

                                    tituloReintentos.style.display = 'block';
                                    contenedorReintentos.appendChild(tarjetaClonada);
                                    tarjetaOriginal.style.display = 'none';
                                }, 300);
                            }, 600);
                        }
                    }

                    // 3. Comprobar finalizacion
                    if (preguntasRespondidasOriginales === TOTAL_PREGUNTAS_INICIALES) {
                        if (contenedorReintentos.children.length === 0) {
                            mostrarEvaluacionFinal(aciertosPrimerIntento, TOTAL_PREGUNTAS_INICIALES);
                        }
                    }
                }
            });

            formularioQuiz.addEventListener('submit', function (evento) {
                evento.preventDefault();
                mostrarEvaluacionFinal(aciertosPrimerIntento, TOTAL_PREGUNTAS_INICIALES);
            });

            function mostrarEvaluacionFinal(nota, total) {
                const porcentajeExito = ((nota / total) * 100).toFixed(1);

                if (cajaResultado) {
                    cajaResultado.style.display = 'block';
                    cajaResultado.innerHTML = `
                <div class="score-summary">
                    <h2>Simulación Finalizada</h2>
                    <p class="score-text">Respuestas correctas a la primera oportunidad: <strong>${nota}</strong> de un total de <strong>${total}</strong>.</p>
                    <p class="percentage-text">Porcentaje de efectividad directa: <strong>${porcentajeExito}%</strong></p>
                </div>
            `;
                }

                if (cajaDocumentacionQA) {
                    cajaDocumentacionQA.style.display = 'block';
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });