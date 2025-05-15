document.getElementById('searchInput').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const diseaseCards = document.querySelectorAll('.disease-card');

    diseaseCards.forEach(card => {
        const title = card.querySelector('h2').textContent.toLowerCase();
        if (title.includes(filter)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
});

// Enhanced disease data with multiple images per disease
const diseaseDatabase = {
  "Apple": [
    {
      name: "Apple Black Rot",
      images: [
        "apple/black_rot_1.jpg",
        "apple/black_rot_2.jpg",
        "apple/black_rot_3.jpg"
      ],
      description: "Fungal disease causing fruit rot and leaf spots, leading to significant yield loss.",
      cure: "Remove infected plant material and apply fungicides during bloom period.",
      ayurvedic: "Neem oil spray (2%) every 10-14 days during growing season.",
      englishMeds: "Fungicides containing captan or thiophanate-methyl."
    },
    {
      name: "Apple Scab",
      images: [
        "apple/scab_1.jpg",
        "apple/scab_2.jpg",
        "apple/scab_3.jpg"
      ],
      description: "Causes olive-green to black spots on leaves and fruit, leading to defoliation and fruit cracking.",
      cure: "Apply fungicides at green tip stage and continue through petal fall.",
      ayurvedic: "Garlic extract spray (5%) weekly during wet periods.",
      englishMeds: "Myclobutanil or sulfur-based fungicides."
    },
    {
      name: "Cedar Apple Rust",
      images: [
        "apple/cedar_rust_1.jpg",
        "apple/cedar_rust_2.jpg",
        "apple/cedar_rust_3.jpg"
      ],
      description: "Causes yellow spots on leaves that turn orange with time, requires both apple and cedar hosts.",
      cure: "Remove nearby cedar trees or apply protective fungicides.",
      ayurvedic: "Baking soda solution (1 tbsp per gallon) sprayed every 7 days.",
      englishMeds: "Triazole fungicides like myclobutanil."
    }
  ],
  "Cherry": [
    {
      name: "Cherry Powdery Mildew",
      images: [
        "cherry/powdery_mildew_1.jpg",
        "cherry/powdery_mildew_2.jpg",
        "cherry/powdery_mildew_3.jpg"
      ],
      description: "White powdery growth on leaves and shoots, causing distortion and reduced fruit quality.",
      cure: "Improve air circulation and apply fungicides during susceptible periods.",
      ayurvedic: "Milk spray (1:9 ratio with water) applied weekly.",
      englishMeds: "Sulfur or potassium bicarbonate-based fungicides."
    }
  ],
  "Corn (maize)": [
    {
      name: "Corn Cercospora Leaf Spot",
      images: [
        "corn/cercospora_1.jpg",
        "corn/cercospora_2.jpg",
        "corn/cercospora_3.jpg"
      ],
      description: "Small, circular to elliptical spots with tan centers and reddish-brown margins on leaves.",
      cure: "Rotate crops and use resistant varieties.",
      ayurvedic: "Neem oil spray applied every 10-14 days.",
      englishMeds: "Chlorothalonil or mancozeb fungicides."
    },
    {
      name: "Corn Northern Leaf Blight",
      images: [
        "corn/northern_blight_1.jpg",
        "corn/northern_blight_2.jpg",
        "corn/northern_blight_3.jpg"
      ],
      description: "Large, cigar-shaped lesions on leaves that can coalesce and kill entire leaves.",
      cure: "Plant resistant hybrids and practice crop rotation.",
      ayurvedic: "Garlic extract spray applied preventatively.",
      englishMeds: "Fungicides containing pyraclostrobin or azoxystrobin."
    },
    {
      name: "Corn Rust",
      images: [
        "corn/rust_1.jpg",
        "corn/rust_2.jpg",
        "corn/rust_3.jpg"
      ],
      description: "Orange to brown pustules on leaves that rupture to release spores.",
      cure: "Plant early-maturing varieties to avoid peak rust periods.",
      ayurvedic: "Baking soda spray (1 tbsp per gallon of water).",
      englishMeds: "Triazole or strobilurin fungicides."
    }
  ],
  "Grape": [
    {
      name: "Grape Black Measles",
      images: [
        "grape/black_measles_1.jpg",
        "grape/black_measles_2.jpg",
        "grape/black_measles_3.jpg"
      ],
      description: "Dark, measles-like spots on berries and leaves, caused by fungal infection.",
      cure: "Prune infected wood and apply fungicides during wet periods.",
      ayurvedic: "Horsetail tea spray applied every 2 weeks.",
      englishMeds: "Tebuconazole or boscalid fungicides."
    },
    {
      name: "Grape Black Rot",
      images: [
        "grape/black_rot_1.jpg",
        "grape/black_rot_2.jpg",
        "grape/black_rot_3.jpg"
      ],
      description: "Brown lesions on leaves and shriveled, mummified berries.",
      cure: "Remove mummified berries and apply protectant fungicides.",
      ayurvedic: "Neem oil spray every 10 days during growing season.",
      englishMeds: "Mancozeb or captan fungicides."
    },
    {
      name: "Grape Leaf Blight",
      images: [
        "grape/leaf_blight_1.jpg",
        "grape/leaf_blight_2.jpg",
        "grape/leaf_blight_3.jpg"
      ],
      description: "Large, irregular brown spots on leaves leading to premature defoliation.",
      cure: "Improve air circulation and avoid overhead irrigation.",
      ayurvedic: "Compost tea spray applied every 2 weeks.",
      englishMeds: "Copper-based fungicides."
    }
  ],
  "Orange": [
    {
      name: "Orange Black Spot",
      images: [
        "orange/black_spot_1.jpg",
        "orange/black_spot_2.jpg",
        "orange/black_spot_3.jpg"
      ],
      description: "Dark, sunken spots on fruit that reduce marketability.",
      cure: "Prune for good air circulation and apply copper sprays.",
      ayurvedic: "Neem oil spray every 14 days.",
      englishMeds: "Copper hydroxide or strobilurin fungicides."
    },
    {
      name: "Orange Canker",
      images: [
        "orange/canker_1.jpg",
        "orange/canker_2.jpg",
        "orange/canker_3.jpg"
      ],
      description: "Raised, scabby lesions on fruit, leaves, and twigs.",
      cure: "Remove infected material and apply copper bactericides.",
      ayurvedic: "Garlic extract spray every 10 days.",
      englishMeds: "Copper-based bactericides."
    },
    {
      name: "Orange Haunglongbing",
      images: [
        "orange/huanglongbing_1.jpg",
        "orange/huanglongbing_2.jpg",
        "orange/huanglongbing_3.jpg"
      ],
      description: "Also called citrus greening, causes yellow shoots and misshapen fruit.",
      cure: "Control psyllid vectors and remove infected trees.",
      ayurvedic: "No effective cure - focus on prevention.",
      englishMeds: "Insecticides to control psyllids."
    }
  ],
  "Peach": [
    {
      name: "Peach Bacterial Spot",
      images: [
        "peach/bacterial_spot_1.jpg",
        "peach/bacterial_spot_2.jpg",
        "peach/bacterial_spot_3.jpg"
      ],
      description: "Small, dark spots on leaves and fruit that may fall out creating 'shot holes'.",
      cure: "Plant resistant varieties and apply copper sprays during bloom.",
      ayurvedic: "Garlic-chili spray every 7-10 days.",
      englishMeds: "Streptomycin or oxytetracycline."
    }
  ],
  "Pepper Bell": [
    {
      name: "Pepper Bell Bacterial Spot",
      images: [
        "pepper/bacterial_spot_1.jpg",
        "pepper/bacterial_spot_2.jpg",
        "pepper/bacterial_spot_3.jpg"
      ],
      description: "Water-soaked spots on leaves that become necrotic with yellow halos.",
      cure: "Use disease-free seed and practice crop rotation.",
      ayurvedic: "Copper spray every 7-10 days.",
      englishMeds: "Copper-based bactericides."
    }
  ],
  "Potato": [
    {
      name: "Potato Early Blight",
      images: [
        "potato/early_blight_1.jpg",
        "potato/early_blight_2.jpg",
        "potato/early_blight_3.jpg"
      ],
      description: "Concentric rings on leaves creating 'target' pattern, leading to defoliation.",
      cure: "Rotate crops and apply fungicides when conditions favor disease.",
      ayurvedic: "Horsetail tea spray every 10 days.",
      englishMeds: "Chlorothalonil or mancozeb fungicides."
    },
    {
      name: "Potato Late Blight",
      images: [
        "potato/late_blight_1.jpg",
        "potato/late_blight_2.jpg",
        "potato/late_blight_3.jpg"
      ],
      description: "Water-soaked lesions that rapidly expand, destroying foliage and tubers.",
      cure: "Destroy infected plants and avoid overhead watering.",
      ayurvedic: "Baking soda spray (1 tbsp per gallon).",
      englishMeds: "Metalaxyl or fosetyl-aluminum fungicides."
    }
  ],
  "Rice": [
    {
      name: "Rice Bacterial Blight",
      images: [
        "rice/bacterial_blight_1.jpg",
        "rice/bacterial_blight_2.jpg",
        "rice/bacterial_blight_3.jpg"
      ],
      description: "Yellow streaks on leaves that turn white, leading to reduced grain filling.",
      cure: "Use resistant varieties and avoid excessive nitrogen.",
      ayurvedic: "Garlic-chili extract spray every 10 days.",
      englishMeds: "Streptomycin sulfate or copper compounds."
    },
    {
      name: "Rice Blast",
      images: [
        "rice/blast_1.jpg",
        "rice/blast_2.jpg",
        "rice/blast_3.jpg"
      ],
      description: "Diamond-shaped lesions on leaves and neck rot that can destroy entire panicles.",
      cure: "Plant resistant varieties and maintain proper water management.",
      ayurvedic: "Fermented buttermilk spray (10%) every 2 weeks.",
      englishMeds: "Tricyclazole or isoprothiolane fungicides."
    },
    {
      name: "Rice Brownspot",
      images: [
        "rice/brownspot_1.jpg",
        "rice/brownspot_2.jpg",
        "rice/brownspot_3.jpg"
      ],
      description: "Small brown spots on leaves that can coalesce, reducing photosynthesis.",
      cure: "Improve soil fertility with silicon and zinc.",
      ayurvedic: "Neem seed kernel extract (5%) fortnightly.",
      englishMeds: "Mancozeb or propiconazole applications."
    },
    {
      name: "Rice Tungro",
      images: [
        "rice/tungro_1.jpg",
        "rice/tungro_2.jpg",
        "rice/tungro_3.jpg"
      ],
      description: "Viral disease causing stunting and yellow-orange leaf discoloration, spread by leafhoppers.",
      cure: "Control leafhopper vectors and remove infected plants.",
      ayurvedic: "No effective cure - focus on prevention with healthy soil.",
      englishMeds: "Insecticides to control vectors like imidacloprid."
    }
  ],
  "Squash": [
    {
      name: "Squash Powdery Mildew",
      images: [
        "squash/powdery_mildew_1.jpg",
        "squash/powdery_mildew_2.jpg",
        "squash/powdery_mildew_3.jpg"
      ],
      description: "White powdery growth on leaves that reduces photosynthesis and yield.",
      cure: "Plant resistant varieties and improve air circulation.",
      ayurvedic: "Milk spray (1:9 ratio with water) weekly.",
      englishMeds: "Potassium bicarbonate or sulfur fungicides."
    }
  ],
  "Strawberry": [
    {
      name: "Strawberry Leaf Scorch",
      images: [
        "strawberry/leaf_scorch_1.jpg",
        "strawberry/leaf_scorch_2.jpg",
        "strawberry/leaf_scorch_3.jpg"
      ],
      description: "Purple spots on leaves that coalesce into large scorched areas.",
      cure: "Remove old leaves after harvest and apply fungicides.",
      ayurvedic: "Compost tea spray every 10 days.",
      englishMeds: "Myclobutanil or trifloxystrobin fungicides."
    }
  ],
  "Sugarcane": [
    {
      name: "Sugarcane Mosaic",
      images: [
        "sugarcane/mosaic_1.jpg",
        "sugarcane/mosaic_2.jpg",
        "sugarcane/mosaic_3.jpg"
      ],
      description: "Light and dark green mosaic pattern on leaves, causing stunting.",
      cure: "Plant virus-free seed cane and control aphid vectors.",
      ayurvedic: "Neem oil spray to deter aphids.",
      englishMeds: "No cure - remove infected plants."
    },
    {
      name: "Sugarcane RedRot",
      images: [
        "sugarcane/redrot_1.jpg",
        "sugarcane/redrot_2.jpg",
        "sugarcane/redrot_3.jpg"
      ],
      description: "Red discoloration inside stalks with sour smell, causing wilting.",
      cure: "Use disease-free seed pieces and practice crop rotation.",
      ayurvedic: "Garlic extract drench for planted cuttings.",
      englishMeds: "Hot water treatment of seed cane."
    },
    {
      name: "Sugarcane Rust",
      images: [
        "sugarcane/rust_1.jpg",
        "sugarcane/rust_2.jpg",
        "sugarcane/rust_3.jpg"
      ],
      description: "Orange pustules on leaves that reduce photosynthetic area.",
      cure: "Plant resistant varieties and avoid excessive nitrogen.",
      ayurvedic: "Baking soda spray (1 tbsp per gallon).",
      englishMeds: "Triazole fungicides if severe."
    },
    {
      name: "Sugarcane Yellow",
      images: [
        "sugarcane/yellow_1.jpg",
        "sugarcane/yellow_2.jpg",
        "sugarcane/yellow_3.jpg"
      ],
      description: "Yellowing of leaves starting from tips, caused by phytoplasma.",
      cure: "Remove infected plants and control leafhopper vectors.",
      ayurvedic: "Neem oil spray to deter leafhoppers.",
      englishMeds: "Insecticides to control vectors."
    }
  ],
  "Tomato": [
    {
      name: "Tomato Bacterial Spot",
      images: [
        "tomato/bacterial_spot_1.jpg",
        "tomato/bacterial_spot_2.jpg",
        "tomato/bacterial_spot_3.jpg"
      ],
      description: "Small, water-soaked spots on leaves that turn brown and necrotic.",
      cure: "Use disease-free seeds and practice crop rotation.",
      ayurvedic: "Copper-based sprays every 7-10 days.",
      englishMeds: "Streptomycin or oxytetracycline sprays."
    },
    {
      name: "Tomato Early Blight",
      images: [
        "tomato/early_blight_1.jpg",
        "tomato/early_blight_2.jpg",
        "tomato/early_blight_3.jpg"
      ],
      description: "Causes concentric rings on leaves, stems, and fruit, leading to defoliation.",
      cure: "Remove infected leaves and improve air circulation.",
      ayurvedic: "Milk spray (1 part milk to 9 parts water) weekly.",
      englishMeds: "Chlorothalonil or mancozeb fungicides."
    },
    {
      name: "Tomato Late Blight",
      images: [
        "tomato/late_blight_1.jpg",
        "tomato/late_blight_2.jpg",
        "tomato/late_blight_3.jpg"
      ],
      description: "Destructive disease causing water-soaked lesions that rapidly expand in cool, wet weather.",
      cure: "Destroy infected plants and avoid overhead watering.",
      ayurvedic: "Horsetail tea spray every 5-7 days during wet periods.",
      englishMeds: "Metalaxyl or fosetyl-aluminum fungicides."
    },
    {
      name: "Tomato Leaf Mold",
      images: [
        "tomato/leaf_mold_1.jpg",
        "tomato/leaf_mold_2.jpg",
        "tomato/leaf_mold_3.jpg"
      ],
      description: "Yellow spots on upper leaf surfaces with grayish-purple mold underneath.",
      cure: "Improve ventilation and reduce humidity in greenhouses.",
      ayurvedic: "Baking soda spray (1 tbsp per gallon) weekly.",
      englishMeds: "Chlorothalonil or copper fungicides."
    },
    {
      name: "Tomato Mosaic Virus",
      images: [
        "tomato/mosaic_1.jpg",
        "tomato/mosaic_2.jpg",
        "tomato/mosaic_3.jpg"
      ],
      description: "Mottled light and dark green patterns on leaves with leaf distortion.",
      cure: "Use virus-free seed and control aphid vectors.",
      ayurvedic: "Milk spray to inhibit virus transmission.",
      englishMeds: "No cure - remove infected plants."
    },
    {
      name: "Tomato Septoria Leaf Spot",
      images: [
        "tomato/septoria_1.jpg",
        "tomato/septoria_2.jpg",
        "tomato/septoria_3.jpg"
      ],
      description: "Small circular spots with dark margins and light centers on lower leaves.",
      cure: "Remove infected leaves and avoid overhead watering.",
      ayurvedic: "Garlic extract spray every 7 days.",
      englishMeds: "Chlorothalonil or mancozeb fungicides."
    },
    {
      name: "Tomato Spider Mites",
      images: [
        "tomato/spider_mites_1.jpg",
        "tomato/spider_mites_2.jpg",
        "tomato/spider_mites_3.jpg"
      ],
      description: "Fine webbing on leaves with stippling and yellowing of foliage.",
      cure: "Increase humidity and use biological controls.",
      ayurvedic: "Neem oil spray every 5-7 days.",
      englishMeds: "Miticides like abamectin if severe."
    },
    {
      name: "Tomato Target Spot",
      images: [
        "tomato/target_spot_1.jpg",
        "tomato/target_spot_2.jpg",
        "tomato/target_spot_3.jpg"
      ],
      description: "Dark spots with concentric rings and yellow halos on leaves and fruit.",
      cure: "Improve air circulation and apply fungicides preventatively.",
      ayurvedic: "Compost tea spray every 10 days.",
      englishMeds: "Chlorothalonil or azoxystrobin fungicides."
    },
    {
      name: "Tomato Yellow Leaf Curl Virus",
      images: [
        "tomato/yellow_curl_1.jpg",
        "tomato/yellow_curl_2.jpg",
        "tomato/yellow_curl_3.jpg"
      ],
      description: "Upward curling of leaves with yellow margins, spread by whiteflies.",
      cure: "Control whitefly vectors and remove infected plants.",
      ayurvedic: "Neem oil to deter whiteflies.",
      englishMeds: "Insecticides to control whiteflies."
    }
  ]
};

// Healthy Plants Database
const healthyPlantsDatabase = {
  "Apple": {
    name: "Healthy Apple",
    images: [
      "apple/healthy_1.jpg",
      "apple/healthy_2.jpg",
      "apple/healthy_3.jpg"
    ],
    description: "A healthy apple tree with vibrant green leaves and properly developing fruit.",
    characteristics: [
      "Uniform leaf color with no spots",
      "Firm, unblemished fruit",
      "Strong new growth",
      "No signs of fungal growth"
    ],
    affectedBy: [
      "Apple Scab",
      "Apple Black Rot",
      "Cedar Apple Rust"
    ]
  },
  "Blueberry": {
    name: "Healthy Blueberry",
    images: [
      "blueberry/healthy_1.jpg",
      "blueberry/healthy_2.jpg",
      "blueberry/healthy_3.jpg"
    ],
    description: "Healthy blueberry bushes with uniform foliage and plump berries.",
    characteristics: [
      "Dark green leaves without spots",
      "Firm, plump berries",
      "No leaf discoloration",
      "Vigorous new growth"
    ],
    affectedBy: [
      "Blueberry Rust",
      "Blueberry Leaf Spot"
    ]
  },
  "Cherry": {
    name: "Healthy Cherry",
    images: [
      "cherry/healthy_1.jpg",
      "cherry/healthy_2.jpg",
      "cherry/healthy_3.jpg"
    ],
    description: "Healthy cherry tree with glossy leaves and well-formed fruit.",
    characteristics: [
      "Glossy green leaves",
      "Smooth bark without cankers",
      "Uniform fruit development",
      "No powdery residue on leaves"
    ],
    affectedBy: [
      "Cherry Powdery Mildew",
      "Cherry Leaf Spot"
    ]
  },
  "Corn (maize)": {
    name: "Healthy Corn",
    images: [
      "corn/healthy_1.jpg",
      "corn/healthy_2.jpg",
      "corn/healthy_3.jpg"
    ],
    description: "Healthy corn plants with upright growth and uniform coloration.",
    characteristics: [
      "Straight, upright stalks",
      "Uniform leaf color",
      "Well-developed ears",
      "No lesions or spots"
    ],
    affectedBy: [
      "Corn Cercospora Leaf Spot",
      "Corn Northern Leaf Blight",
      "Corn Rust"
    ]
  },
  "Grape": {
    name: "Healthy Grape",
    images: [
      "grape/healthy_1.jpg",
      "grape/healthy_2.jpg",
      "grape/healthy_3.jpg"
    ],
    description: "Healthy grape vines with lush foliage and developing clusters.",
    characteristics: [
      "Dark green leaves without spots",
      "Firm canes with good coloration",
      "Developing fruit clusters",
      "No powdery residue"
    ],
    affectedBy: [
      "Grape Black Measles",
      "Grape Black Rot",
      "Grape Leaf Blight"
    ]
  },
  "Orange": {
    name: "Healthy Orange",
    images: [
      "orange/healthy_1.jpg",
      "orange/healthy_2.jpg",
      "orange/healthy_3.jpg"
    ],
    description: "Healthy orange tree with glossy leaves and developing fruit.",
    characteristics: [
      "Glossy dark green leaves",
      "Smooth fruit skin",
      "No leaf curling",
      "Vigorous new growth"
    ],
    affectedBy: [
      "Orange Black Spot",
      "Orange Canker",
      "Orange Haunglongbing"
    ]
  },
  "Peach": {
    name: "Healthy Peach",
    images: [
      "peach/healthy_1.jpg",
      "peach/healthy_2.jpg",
      "peach/healthy_3.jpg"
    ],
    description: "Healthy peach tree with vibrant foliage and developing fruit.",
    characteristics: [
      "Lance-shaped leaves without spots",
      "Smooth bark without cankers",
      "Developing fuzzy fruit",
      "No leaf curl symptoms"
    ],
    affectedBy: [
      "Peach Bacterial Spot",
      "Peach Leaf Curl"
    ]
  },
  "Pepper Bell": {
    name: "Healthy Bell Pepper",
    images: [
      "pepper/healthy_1.jpg",
      "pepper/healthy_2.jpg",
      "pepper/healthy_3.jpg"
    ],
    description: "Healthy pepper plants with lush foliage and developing peppers.",
    characteristics: [
      "Dark green leaves without spots",
      "Sturdy stems",
      "Developing glossy peppers",
      "No leaf yellowing"
    ],
    affectedBy: [
      "Pepper Bell Bacterial Spot",
      "Pepper Anthracnose"
    ]
  },
  "Potato": {
    name: "Healthy Potato",
    images: [
      "potato/healthy_1.jpg",
      "potato/healthy_2.jpg",
      "potato/healthy_3.jpg"
    ],
    description: "Healthy potato plants with vigorous foliage growth.",
    characteristics: [
      "Uniform leaf color",
      "No leaf spots",
      "Sturdy stems",
      "No wilting symptoms"
    ],
    affectedBy: [
      "Potato Early Blight",
      "Potato Late Blight"
    ]
  },
  "Raspberry": {
    name: "Healthy Raspberry",
    images: [
      "raspberry/healthy_1.jpg",
      "raspberry/healthy_2.jpg",
      "raspberry/healthy_3.jpg"
    ],
    description: "Healthy raspberry canes with lush foliage and developing berries.",
    characteristics: [
      "Dark green leaves without spots",
      "Firm canes",
      "Developing plump berries",
      "No powdery residue"
    ],
    affectedBy: [
      "Raspberry Rust",
      "Raspberry Leaf Spot"
    ]
  },
  "Rice": {
    name: "Healthy Rice",
    images: [
      "rice/healthy_1.jpg",
      "rice/healthy_2.jpg",
      "rice/healthy_3.jpg"
    ],
    description: "Healthy rice plants with upright growth and uniform coloration.",
    characteristics: [
      "Uniform green color",
      "Upright growth habit",
      "No lesions on leaves",
      "No stunting or discoloration"
    ],
    affectedBy: [
      "Rice Blast",
      "Rice Brown Spot",
      "Rice Bacterial Blight",
      "Rice Tungro"
    ]
  },
  "Soybean": {
    name: "Healthy Soybean",
    images: [
      "soybean/healthy_1.jpg",
      "soybean/healthy_2.jpg",
      "soybean/healthy_3.jpg"
    ],
    description: "Healthy soybean plants with uniform foliage and developing pods.",
    characteristics: [
      "Trifoliate leaves without spots",
      "Sturdy stems",
      "Developing pods",
      "No leaf yellowing"
    ],
    affectedBy: [
      "Soybean Rust",
      "Soybean Mosaic Virus"
    ]
  },
  "Squash": {
    name: "Healthy Squash",
    images: [
      "squash/healthy_1.jpg",
      "squash/healthy_2.jpg",
      "squash/healthy_3.jpg"
    ],
    description: "Healthy squash plants with large leaves and developing fruit.",
    characteristics: [
      "Large, unblemished leaves",
      "Vigorous vines",
      "Developing squash fruit",
      "No powdery residue"
    ],
    affectedBy: [
      "Squash Powdery Mildew",
      "Squash Vine Borer"
    ]
  },
  "Strawberry": {
    name: "Healthy Strawberry",
    images: [
      "strawberry/healthy_1.jpg",
      "strawberry/healthy_2.jpg",
      "strawberry/healthy_3.jpg"
    ],
    description: "Healthy strawberry plants with lush foliage and developing berries.",
    characteristics: [
      "Dark green leaves without spots",
      "Developing red berries",
      "No leaf scorch",
      "Vigorous runners"
    ],
    affectedBy: [
      "Strawberry Leaf Scorch",
      "Strawberry Powdery Mildew"
    ]
  },
  "Sugarcane": {
    name: "Healthy Sugarcane",
    images: [
      "sugarcane/healthy_1.jpg",
      "sugarcane/healthy_2.jpg",
      "sugarcane/healthy_3.jpg"
    ],
    description: "Healthy sugarcane stalks with uniform growth and coloration.",
    characteristics: [
      "Tall, straight stalks",
      "Uniform leaf color",
      "No leaf spots",
      "No stalk discoloration"
    ],
    affectedBy: [
      "Sugarcane Mosaic",
      "Sugarcane RedRot",
      "Sugarcane Rust",
      "Sugarcane Yellow"
    ]
  },
  "Tomato": {
    name: "Healthy Tomato",
    images: [
      "tomato/healthy_1.jpg",
      "tomato/healthy_2.jpg",
      "tomato/healthy_3.jpg"
    ],
    description: "Healthy tomato plants with dark green foliage and developing fruit.",
    characteristics: [
      "Deep green leaves without spots",
      "Sturdy stems",
      "Uniform fruit development",
      "No leaf curling"
    ],
    affectedBy: [
      "Tomato Early Blight",
      "Tomato Late Blight",
      "Tomato Bacterial Spot",
      "Tomato Yellow Leaf Curl Virus"
    ]
  }
};

    // Initialize the page
    function initPage() {
      loading.style.display = 'block';
      
      setTimeout(() => {
        createDiseaseAccordions();
        createHealthyAccordions();
        initializeImageSliders();
        loading.style.display = 'none';
      }, 800);
    }

    // Create disease accordions
    function createDiseaseAccordions() {
      const container = document.getElementById('diseaseContainer');
      container.innerHTML = '';
      
      for (let crop in diseaseDatabase) {
        const diseases = diseaseDatabase[crop];
        
        const button = document.createElement('button');
        button.className = 'accordion disease-accordion';
        button.innerHTML = `
            <i class="fas fa-seedling"></i> 
            <span class="crop-name">${crop}</span>
            <span class="count-badge">${diseases.length}</span>
        `;
        
        const panel = document.createElement('div');
        panel.className = 'panel';
        
        const grid = document.createElement('div');
        grid.className = 'disease-grid';
        
        diseases.forEach(disease => {
          grid.appendChild(createDiseaseCard(disease));
        });
        
        panel.appendChild(grid);
        container.appendChild(button);
        container.appendChild(panel);
      }
    }

    // Create healthy plant accordions
    function createHealthyAccordions() {
      const container = document.getElementById('healthyContainer');
      container.innerHTML = '';
      
      for (let crop in healthyPlantsDatabase) {
        const plant = healthyPlantsDatabase[crop];
        
        const button = document.createElement('button');
        button.className = 'accordion healthy-accordion';
        button.innerHTML = `
            <i class="fas fa-leaf"></i> 
            <span class="crop-name">${crop}</span>
            <span class="count-badge">${healthyPlantsDatabase[crop].affectedBy.length}</span>
        `;
        
        const panel = document.createElement('div');
        panel.className = 'panel';
        
        const card = document.createElement('div');
        card.className = 'disease-card';
        card.dataset.name = plant.name.toLowerCase();
        
        card.innerHTML = `
          <div class="image-slider">
            <div class="slider-images">
              ${plant.images.map(img => `
                <img src="/static/assets/diseases/${img}" alt="${plant.name}" 
                     onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"150\" viewBox=\"0 0 200 150\"%3E%3Crect fill=\"%23f0f0f0\" width=\"200\" height=\"150\"%3E%3C/rect%3E%3Ctext fill=\"%23aaa\" font-family=\"sans-serif\" font-size=\"12\" dy=\"4\" text-anchor=\"middle\" x=\"100\" y=\"75\"%3EImage not available%3C/text%3E%3C/svg%3E'">
              `).join('')}
            </div>
            <div class="slider-dots">
              ${plant.images.map((_, index) => `
                <div class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
              `).join('')}
            </div>
          </div>
          <div class="disease-info">
            <h2>${plant.name}</h2>
            <p><strong><i class="fas fa-info-circle"></i> Description:</strong> ${plant.description}</p>
            <p><strong><i class="fas fa-check-circle"></i> Characteristics:</strong></p>
            <ul>
              ${plant.characteristics.map(char => `<li>${char}</li>`).join('')}
            </ul>
            <div class="affected-diseases">
              <h4><i class="fas fa-exclamation-triangle"></i> Can be affected by:</h4>
              <ul>
                ${plant.affectedBy.map(disease => `<li>${disease}</li>`).join('')}
              </ul>
            </div>
          </div>`;
        
        panel.appendChild(card);
        container.appendChild(button);
        container.appendChild(panel);
      }
    }

// DOM elements
const accordionContainer = document.getElementById('accordionContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const noResults = document.querySelector('.no-results');
const loading = document.querySelector('.loading');
const diseaseContainer = document.getElementById('diseaseContainer');
const healthyContainer = document.getElementById('healthyContainer');

// Initialize the page
function initPage() {
    loading.style.display = 'block';
    
    setTimeout(() => {
        createDiseaseAccordions();
        createHealthyAccordions();
        initializeImageSliders();
        loading.style.display = 'none';
    }, 800);
}

// Create disease cards with image sliders
function createDiseaseCard(disease) {
    const card = document.createElement('div');
    card.className = 'disease-card';
    card.dataset.name = disease.name.toLowerCase();
    
    const sliderHTML = `
    <div class="image-slider">
        <div class="slider-images">
        ${disease.images.map(img => `
            <img src="/static/assets/diseases/${img}" alt="${disease.name}" 
                onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"150\" viewBox=\"0 0 200 150\"%3E%3Crect fill=\"%23f0f0f0\" width=\"200\" height=\"150\"%3E%3C/rect%3E%3Ctext fill=\"%23aaa\" font-family=\"sans-serif\" font-size=\"12\" dy=\"4\" text-anchor=\"middle\" x=\"100\" y=\"75\"%3EImage not available%3C/text%3E%3C/svg%3E'">
        `).join('')}
        </div>
        <div class="slider-dots">
        ${disease.images.map((_, index) => `
            <div class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
        `).join('')}
        </div>
    </div>
    <div class="disease-info">
        <h2>${disease.name}</h2>
        <p><strong><i class="fas fa-info-circle"></i> Description:</strong> ${disease.description}</p>
        <p><strong><i class="fas fa-heartbeat"></i> General Cure:</strong> ${disease.cure}</p>
        <p><strong><i class="fas fa-leaf"></i> Ayurvedic:</strong> ${disease.ayurvedic}</p>
        <p><strong><i class="fas fa-flask"></i> Chemical Treatment:</strong> ${disease.englishMeds}</p>
    </div>`;
    
    card.innerHTML = sliderHTML;
    return card;
}

// Create healthy plant cards
function createHealthyPlantCard(plant) {
    const card = document.createElement('div');
    card.className = 'disease-card';
    card.dataset.name = plant.name.toLowerCase();
    
    card.innerHTML = `
    <div class="image-slider">
        <div class="slider-images">
        ${plant.images.map(img => `
            <img src="/static/assets/diseases/${img}" alt="${plant.name}" 
                onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"150\" viewBox=\"0 0 200 150\"%3E%3Crect fill=\"%23f0f0f0\" width=\"200\" height=\"150\"%3E%3C/rect%3E%3Ctext fill=\"%23aaa\" font-family=\"sans-serif\" font-size=\"12\" dy=\"4\" text-anchor=\"middle\" x=\"100\" y=\"75\"%3EImage not available%3C/text%3E%3C/svg%3E'">
        `).join('')}
        </div>
        <div class="slider-dots">
        ${plant.images.map((_, index) => `
            <div class="slider-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
        `).join('')}
        </div>
    </div>
    <div class="disease-info">
        <h2>${plant.name}</h2>
        <p><strong><i class="fas fa-info-circle"></i> Description:</strong> ${plant.description}</p>
        <p><strong><i class="fas fa-check-circle"></i> Characteristics:</strong></p>
        <ul>
        ${plant.characteristics.map(char => `<li>${char}</li>`).join('')}
        </ul>
        <div class="affected-diseases">
        <h4><i class="fas fa-exclamation-triangle"></i> Can be affected by:</h4>
        <ul>
            ${plant.affectedBy.map(disease => `<li>${disease}</li>`).join('')}
        </ul>
        </div>
    </div>`;
    
    return card;
}

// Initialize all image sliders with auto-rotation
function initializeImageSliders() {
    document.querySelectorAll('.image-slider').forEach(slider => {
        const images = slider.querySelector('.slider-images');
        const dots = slider.querySelectorAll('.slider-dot');
        let currentIndex = 0;
        let intervalId;
        let isPaused = false;

        function startSlider() {
            intervalId = setInterval(() => {
                if (!isPaused) {
                    currentIndex = (currentIndex + 1) % 3;
                    updateSlider();
                }
            }, 3000);
        }

        function updateSlider() {
            images.style.transform = `translateX(-${currentIndex * 33.33}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                currentIndex = parseInt(dot.dataset.index);
                updateSlider();
            });
        });

        slider.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        slider.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        slider.addEventListener('click', (e) => {
            if (e.target.classList.contains('slider-dot')) return;
            isPaused = !isPaused;
        });

        startSlider();
    });
}

// Create disease accordions
function createDiseaseAccordions() {
    diseaseContainer.innerHTML = '';
    
    for (let crop in diseaseDatabase) {
        const diseases = diseaseDatabase[crop];
        
        const button = document.createElement('button');
        button.className = 'accordion disease-accordion';
        button.innerHTML = `<i class="fas fa-seedling"></i> ${crop} <span class="count-badge">${diseases.length}</span>`;
        
        const panel = document.createElement('div');
        panel.className = 'panel';
        
        const grid = document.createElement('div');
        grid.className = 'disease-grid';
        
        diseases.forEach(disease => {
            grid.appendChild(createDiseaseCard(disease));
        });
        
        panel.appendChild(grid);
        diseaseContainer.appendChild(button);
        diseaseContainer.appendChild(panel);
    }
    
    // Add accordion functionality
    document.querySelectorAll(".disease-accordion").forEach(button => {
        button.addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            panel.classList.toggle("active");
        });
    });
}

// Create healthy plant accordions
function createHealthyAccordions() {
    healthyContainer.innerHTML = '';
    
    for (let crop in healthyPlantsDatabase) {
        const plant = healthyPlantsDatabase[crop];
        
        const button = document.createElement('button');
        button.className = 'accordion healthy-accordion';
        button.innerHTML = `<i class="fas fa-leaf"></i> ${crop}`;
        
        const panel = document.createElement('div');
        panel.className = 'panel';
        
        panel.appendChild(createHealthyPlantCard(plant));
        healthyContainer.appendChild(button);
        healthyContainer.appendChild(panel);
    }
    
    // Add accordion functionality
    document.querySelectorAll(".healthy-accordion").forEach(button => {
        button.addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            panel.classList.toggle("active");
        });
    });
}

// Search functionality
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    let hasResults = false;
    
    document.querySelectorAll('.disease-card').forEach(card => {
        const cardName = card.dataset.name;
        if (cardName.includes(searchTerm)) {
            card.style.display = 'block';
            hasResults = true;
            
            // Expand parent accordion if match found
            const accordion = card.closest('.panel').previousElementSibling;
            accordion.classList.add('active');
            card.closest('.panel').classList.add('active');
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show no results message if no matches
    noResults.style.display = hasResults ? 'none' : 'block';
});

let lastScrollTop = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", function () {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scroll Down
    header.style.top = "-100px"; // hide navbar
  } else {
    // Scroll Up
    header.style.top = "0"; // show navbar
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});


// Initialize the page when loaded
window.addEventListener('DOMContentLoaded', initPage);  

document.addEventListener('DOMContentLoaded', function() {
  // Hide loader after content loads
  setTimeout(() => {
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('loader').style.display = 'none';
    }, 500);
  }, 1000);

  // Create floating leaves
  createLeafParticles();

  // Accordion functionality
  const accordions = document.querySelectorAll('.accordion');
  accordions.forEach(accordion => {
    accordion.addEventListener('click', function() {
      this.classList.toggle('active');
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
        panel.classList.remove('active');
      } else {
        panel.style.maxHeight = panel.scrollHeight + 'px';
        panel.classList.add('active');
      }
    });
  });

  searchBtn.addEventListener('click', searchDiseases);
  searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') searchDiseases();
  });

  // Image slider functionality
  initImageSliders();
});

function createLeafParticles() {
  const container = document.getElementById('leafParticles');
  const leafCount = 15;
  
  for (let i = 0; i < leafCount; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf-particle';
    
    // Random properties
    const size = Math.random() * 20 + 10;
    const posX = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = Math.random() * 20 + 10;
    const rotation = Math.random() * 360;
    
    leaf.style.width = `${size}px`;
    leaf.style.height = `${size}px`;
    leaf.style.left = `${posX}%`;
    leaf.style.animationDelay = `${delay}s`;
    leaf.style.animationDuration = `${duration}s`;
    leaf.style.transform = `rotate(${rotation}deg)`;
    
    container.appendChild(leaf);
  }
}

function searchDiseases() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const diseaseCards = document.querySelectorAll('.disease-card');
  let found = false;
  
  diseaseCards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    if (cardText.includes(searchTerm)) {
      card.style.display = 'block';
      found = true;
    } else {
      card.style.display = 'none';
    }
  });
  
  const noResults = document.querySelector('.no-results');
  if (found) {
    noResults.style.display = 'none';
  } else {
    noResults.style.display = 'block';
    noResults.classList.add('animate__fadeIn');
  }

    function initImageSliders() {
    const sliders = document.querySelectorAll('.image-slider');
    
    sliders.forEach(slider => {
      const images = slider.querySelector('.slider-images');
      const dots = slider.querySelectorAll('.slider-dot');
      
      if (images.children.length > 1) {
        let currentIndex = 0;
        
        // Set up dots
        dots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
            currentIndex = index;
            updateSlider();
          });
        });
        
        // Auto-rotate images
        setInterval(() => {
          currentIndex = (currentIndex + 1) % images.children.length;
          updateSlider();
        }, 5000);
        
        function updateSlider() {
          images.style.transform = `translateX(-${currentIndex * 100}%)`;
          
          // Update dots
          dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
          });
        }
      } else {
        // Hide dots if only one image
        slider.querySelector('.slider-dots').style.display = 'none';
      }
    });
  }
}