// Comparative Model Accuracy Chart - Line Version
      const comparativeLabels = [
        'MLP + Soil Sensor',
        'CAAR-UNet',
        'Modified LeafNet',
        'StrawberryTalk',
        'MLP-Mixer + LSTM',
        'EfficientNet+DenseNet',
        'SE-SK-CapResNet',
        'ResNet50+Triplet',
        'Our Model'
      ];

      const comparativeData = {
        labels: comparativeLabels,
        datasets: [{
          label: 'Accuracy (%)',
          data: [98, 95.26, 97.44, 97.92, 98.2, 98.56, 98.58, 98.79, 99.39],
          borderColor: 'rgba(46, 125, 50, 1)',
          backgroundColor: 'rgba(46, 125, 50, 0.2)',
          pointBackgroundColor: comparativeLabels.map((_, i) => 
            i === comparativeLabels.length - 1 ? 'rgba(46, 125, 50, 1)' : 'rgba(100, 181, 246, 1)'
          ),
          pointBorderColor: '#fff',
          pointHoverRadius: 8,
          pointRadius: 5,
          borderWidth: 3,
          tension: 0.1,
          fill: true
        }]
      };

      const comparativeConfig = {
        type: 'line',
        data: comparativeData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const models = [
                    'MLP with soil sensor data fusion',
                    'CAAR-UNet segmentation model',
                    'Modified LeafNet for rice diseases',
                    'StrawberryTalk IoT platform',
                    'Meta-Ensemble MLP-Mixer + LSTM',
                    'EfficientNetB0 + DenseNet121 fusion',
                    'SE-SK-CapResNet hybrid architecture',
                    'ResNet50 with Triplet Attention',
                    'Our CNN + Keras Tuner optimized model'
                  ];
                  const datasets = [
                    'Multi-source sensor data',
                    'Custom annotated dataset',
                    'Rice disease dataset',
                    'Strawberry field images',
                    'PlantVillage dataset',
                    'PlantDoc dataset',
                    'Custom collected dataset',
                    'Augmented plant images',
                    'Augmented PlantVillage dataset'
                  ];
                  const idx = context.dataIndex;
                  return [
                    `Model: ${models[idx]}`,
                    `Accuracy: ${context.parsed.y}%`,
                    `Dataset: ${datasets[idx]}`,
                    idx === comparativeLabels.length - 1 ? '★ State-of-the-art result ★' : ''
                  ];
                }
              },
              padding: 12,
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleFont: { size: 14, weight: 'bold' },
              bodyFont: { size: 12 },
              footerFont: { size: 12, style: 'italic' },
              cornerRadius: 12,
              displayColors: false
            },
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: 99.39,
                  yMax: 99.39,
                  borderColor: 'rgba(46, 125, 50, 0.5)',
                  borderWidth: 2,
                  borderDash: [6, 6],
                  label: {
                    content: 'Our Model (99.39%)',
                    enabled: true,
                    position: 'right',
                    backgroundColor: 'rgba(46, 125, 50, 0.7)',
                    color: '#fff',
                    font: { size: 12 }
                  }
                }
              }
            }
          },
          scales: {
            y: {
              min: 94,
              max: 100,
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  return value + '%';
                }
              },
              grid: {
                color: 'rgba(0,0,0,0.1)'
              }
            },
            x: {
              grid: {
                display: false
              },
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          elements: {
            point: {
              radius: function(context) {
                return context.dataIndex === comparativeLabels.length - 1 ? 7 : 5;
              }
            }
          }
        }
      };

      new Chart(
        document.getElementById('comparativeAccuracyChart'),
        comparativeConfig
      );
      // Dark Mode Toggle
      const darkModeToggle = document.getElementById('darkModeToggle');
      const body = document.body;

      // Check for saved user preference
      if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
      }

      // Toggle dark mode
      darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
          body.classList.add('dark-mode');
          localStorage.setItem('darkMode', 'enabled');
        } else {
          body.classList.remove('dark-mode');
          localStorage.setItem('darkMode', 'disabled');
        }
      });

      // Mobile menu toggle
      const hamburger = document.querySelector('.hamburger');
      const nav = document.querySelector('nav');

      hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
      });

      // Animate elements when they come into view
      const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate__animated');
        
        elements.forEach(element => {
          const elementTop = element.getBoundingClientRect().top;
          const elementVisible = 150;
          
          if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = '1';
            if (element.classList.contains('animate__fadeInUp')) {
              element.style.transform = 'translateY(0)';
            }
          }
        });
      };

      // Set initial opacity for animated elements
      document.querySelectorAll('.animate__animated').forEach(el => {
        el.style.opacity = '0';
        if (el.classList.contains('animate__fadeInUp')) {
          el.style.transform = 'translateY(20px)';
        }
      });

      window.addEventListener('scroll', animateOnScroll);
      animateOnScroll(); // Run once on load