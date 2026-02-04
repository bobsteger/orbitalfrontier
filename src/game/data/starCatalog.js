// Bright Star Catalog - Real star data from Hipparcos/Yale catalogs
// Format: [name, right ascension (hours), declination (degrees), apparent magnitude, spectral class]
// Includes ~300 brightest stars visible from Earth

export const STAR_CATALOG = [
  // The brightest stars
  ["Sirius", 6.752, -16.716, -1.46, "A1V"],
  ["Canopus", 6.399, -52.696, -0.74, "A9II"],
  ["Alpha Centauri", 14.660, -60.833, -0.27, "G2V"],
  ["Arcturus", 14.261, 19.182, -0.05, "K1.5III"],
  ["Vega", 18.616, 38.784, 0.03, "A0V"],
  ["Capella", 5.278, 45.998, 0.08, "G8III"],
  ["Rigel", 5.242, -8.202, 0.13, "B8Ia"],
  ["Procyon", 7.655, 5.225, 0.34, "F5IV"],
  ["Achernar", 1.629, -57.237, 0.46, "B6V"],
  ["Betelgeuse", 5.919, 7.407, 0.50, "M1Ia"],
  ["Hadar", 14.064, -60.373, 0.61, "B1III"],
  ["Altair", 19.846, 8.868, 0.76, "A7V"],
  ["Acrux", 12.443, -63.099, 0.76, "B0.5IV"],
  ["Aldebaran", 4.599, 16.509, 0.85, "K5III"],
  ["Antares", 16.490, -26.432, 0.96, "M1.5Iab"],
  ["Spica", 13.420, -11.161, 0.97, "B1V"],
  ["Pollux", 7.755, 28.026, 1.14, "K0III"],
  ["Fomalhaut", 22.961, -29.622, 1.16, "A3V"],
  ["Deneb", 20.690, 45.280, 1.25, "A2Ia"],
  ["Mimosa", 12.795, -59.689, 1.25, "B0.5III"],
  ["Regulus", 10.139, 11.967, 1.35, "B7V"],
  ["Adhara", 6.977, -28.972, 1.50, "B2II"],
  ["Castor", 7.577, 31.888, 1.57, "A1V"],
  ["Gacrux", 12.519, -57.113, 1.63, "M3.5III"],
  ["Shaula", 17.560, -37.104, 1.63, "B2IV"],
  ["Bellatrix", 5.419, 6.350, 1.64, "B2III"],
  ["Elnath", 5.438, 28.608, 1.65, "B7III"],
  ["Miaplacidus", 9.220, -69.717, 1.68, "A1III"],
  ["Alnilam", 5.603, -1.202, 1.70, "B0Ia"],
  ["Alnair", 22.137, -46.961, 1.74, "B7IV"],
  ["Alnitak", 5.679, -1.943, 1.77, "O9.5Ib"],
  ["Alioth", 12.900, 55.960, 1.77, "A0p"],
  ["Dubhe", 11.062, 61.751, 1.79, "K0III"],
  ["Mirfak", 3.405, 49.861, 1.79, "F5Ib"],
  ["Wezen", 7.140, -26.393, 1.84, "F8Ia"],
  ["Sargas", 17.622, -42.998, 1.87, "F1II"],
  ["Kaus Australis", 18.403, -34.385, 1.85, "B9.5III"],
  ["Avior", 8.376, -59.510, 1.86, "K3III"],
  ["Alkaid", 13.792, 49.313, 1.86, "B3V"],
  ["Menkalinan", 5.992, 44.948, 1.90, "A1IV"],
  ["Atria", 16.811, -69.028, 1.92, "K2IIb"],
  ["Alhena", 6.629, 16.399, 1.93, "A0IV"],
  ["Peacock", 20.427, -56.735, 1.94, "B2IV"],
  ["Alsephina", 8.745, -54.709, 1.96, "A0IV"],
  ["Mirzam", 6.378, -17.956, 1.98, "B1II"],
  ["Polaris", 2.530, 89.264, 2.02, "F7Ib"],
  ["Alphard", 9.460, -8.659, 2.00, "K3II"],
  ["Hamal", 2.120, 23.462, 2.00, "K2III"],
  ["Diphda", 0.726, -17.987, 2.02, "K0III"],
  ["Nunki", 18.921, -26.297, 2.02, "B2.5V"],
  ["Menkent", 14.111, -36.370, 2.06, "K0III"],
  ["Alpheratz", 0.140, 29.091, 2.06, "B8IV"],
  ["Saiph", 5.796, -9.670, 2.09, "B0.5Ia"],
  ["Mirach", 1.163, 35.621, 2.05, "M0III"],
  ["Kochab", 14.845, 74.156, 2.08, "K4III"],
  ["Rasalhague", 17.582, 12.560, 2.07, "A5III"],
  ["Algol", 3.136, 40.956, 2.12, "B8V"],
  ["Denebola", 11.818, 14.572, 2.13, "A3V"],
  ["Almach", 2.065, 42.330, 2.26, "K3IIb"],
  ["Tiaki", 22.711, -46.885, 2.39, "K0III"],
  ["Naos", 8.060, -40.003, 2.25, "O5Iaf"],
  ["Muhlifain", 12.692, -48.960, 2.17, "A1V"],
  ["Aspidiske", 9.285, -59.275, 2.25, "A8Ib"],
  ["Suhail", 9.133, -43.433, 2.21, "K4Ib"],
  ["Alphecca", 15.578, 26.715, 2.23, "A0V"],
  ["Mintaka", 5.533, -0.299, 2.23, "O9.5II"],
  ["Sadr", 20.370, 40.257, 2.20, "F8Ib"],
  ["Eltanin", 17.944, 51.489, 2.23, "K5III"],
  ["Schedar", 0.675, 56.537, 2.23, "K0IIIa"],
  ["Dschubba", 16.005, -22.622, 2.32, "B0.3IV"],
  ["Larawag", 17.208, -43.239, 2.29, "K4III"],
  ["Merak", 11.031, 56.382, 2.37, "A1V"],
  ["Izar", 14.750, 27.074, 2.37, "K0II"],
  ["Enif", 21.736, 9.875, 2.39, "K2Ib"],
  ["Ankaa", 0.438, -42.306, 2.38, "K0III"],
  ["Phecda", 11.897, 53.695, 2.44, "A0V"],
  ["Sabik", 17.173, -15.725, 2.43, "A1V"],
  ["Scheat", 23.063, 28.083, 2.42, "M2.5II"],
  ["Aludra", 7.402, -29.303, 2.45, "B5Ia"],
  ["Markab", 23.079, 15.205, 2.49, "B9III"],
  ["Navi", 0.945, 60.717, 2.47, "B0IVe"],
  ["Markeb", 9.368, -55.011, 2.50, "B2IV"],
  ["Aljanah", 20.770, 33.970, 2.48, "K0III"],
  ["Acrab", 16.091, -19.805, 2.62, "B1V"],

  // Orion constellation
  ["Meissa", 5.588, 9.934, 3.33, "O8III"],

  // Ursa Major (Big Dipper)
  ["Megrez", 12.257, 57.033, 3.31, "A3V"],
  ["Muscida", 8.504, 60.718, 3.35, "G4II"],

  // Cassiopeia
  ["Ruchbah", 1.430, 60.235, 2.68, "A5III"],
  ["Segin", 1.907, 63.670, 3.37, "B3III"],

  // Cygnus
  ["Albireo", 19.512, 27.960, 3.18, "K3II"],
  ["Fawaris", 19.749, 45.131, 2.87, "B9III"],

  // Perseus
  ["Atik", 3.964, 40.010, 2.85, "B1III"],
  ["Menkib", 3.982, 35.791, 3.77, "O7.5III"],

  // Scorpius
  ["Lesath", 17.530, -37.296, 2.69, "B2IV"],
  ["Jabbah", 16.199, -19.461, 4.01, "B1V"],
  ["Paikauhale", 17.793, -40.127, 3.00, "F3Ib"],
  ["Iklil", 15.981, -29.214, 3.88, "B1.5V"],

  // Leo
  ["Algieba", 10.333, 19.842, 2.28, "K0III"],
  ["Zosma", 11.235, 20.524, 2.56, "A4V"],
  ["Chertan", 11.237, 15.430, 3.34, "A2V"],
  ["Adhafera", 10.278, 23.417, 3.44, "F0III"],

  // Gemini
  ["Alhena", 6.629, 16.399, 1.93, "A0IV"],
  ["Wasat", 7.335, 21.982, 3.53, "F2IV"],
  ["Mebsuta", 6.732, 25.131, 2.98, "G8Ib"],
  ["Tejat", 6.383, 22.514, 2.88, "M3III"],

  // Taurus
  ["Alcyone", 3.791, 24.105, 2.87, "B7IIIe"],
  ["Atlas", 3.819, 24.053, 3.63, "B8III"],
  ["Electra", 3.747, 24.113, 3.70, "B6IIIe"],
  ["Maia", 3.763, 24.368, 3.88, "B8III"],
  ["Merope", 3.772, 23.948, 4.18, "B6IVe"],
  ["Taygeta", 3.753, 24.467, 4.30, "B6V"],
  ["Celaeno", 3.745, 24.289, 5.46, "B7IV"],

  // Virgo
  ["Zavijava", 11.845, 1.765, 3.61, "F9V"],
  ["Porrima", 12.694, -1.449, 2.74, "F0V"],
  ["Vindemiatrix", 13.036, 10.959, 2.83, "G8III"],
  ["Heze", 13.579, -0.596, 3.37, "A3V"],

  // Aquarius
  ["Sadalsuud", 21.526, -5.571, 2.91, "G0Ib"],
  ["Sadalmelik", 22.096, -0.320, 2.96, "G2Ib"],
  ["Skat", 22.911, -15.821, 3.27, "A3V"],

  // Pisces
  ["Eta Piscium", 1.525, 15.346, 3.62, "G7III"],
  ["Gamma Piscium", 23.286, 3.282, 3.69, "G9III"],

  // Aries
  ["Sheratan", 1.911, 20.808, 2.64, "A5V"],
  ["Mesarthim", 1.898, 19.294, 3.88, "A1p"],

  // Capricornus
  ["Deneb Algedi", 21.784, -16.127, 2.87, "A7III"],
  ["Dabih", 20.350, -14.781, 3.08, "F8V"],
  ["Nashira", 21.668, -16.662, 3.68, "F0p"],

  // Sagittarius
  ["Ascella", 19.043, -29.880, 2.59, "A2IV"],
  ["Kaus Media", 18.349, -29.828, 2.70, "K2III"],
  ["Kaus Borealis", 18.466, -25.422, 2.81, "K1III"],
  ["Alnasl", 18.096, -30.424, 2.99, "K1III"],
  ["Arkab Prior", 19.387, -44.459, 3.96, "B9V"],

  // Libra
  ["Zubenelgenubi", 14.848, -16.042, 2.75, "A3IV"],
  ["Zubeneschamali", 15.283, -9.383, 2.61, "B8V"],

  // Centaurus
  ["Muhlifain", 12.692, -48.960, 2.17, "A1V"],
  ["Ke Kouan", 14.986, -42.104, 2.30, "B2IV"],

  // Crux (Southern Cross)
  ["Imai", 12.252, -58.749, 1.59, "B2IV"],

  // Carina
  ["Tureis", 8.075, -24.304, 2.25, "K3III"],

  // Puppis
  ["Naos", 8.060, -40.003, 2.25, "O5Iaf"],
  ["Azmidi", 7.822, -24.860, 3.17, "G5II"],

  // Vela
  ["Regor", 8.159, -47.337, 1.78, "WC8"],
  ["Suhail", 9.133, -43.433, 2.21, "K4Ib"],

  // Hydra
  ["Alphard", 9.460, -8.659, 2.00, "K3II"],

  // Eridanus
  ["Cursa", 5.131, -5.086, 2.79, "A3III"],
  ["Zaurak", 3.967, -13.509, 2.95, "M1III"],
  ["Rana", 3.721, -9.763, 3.54, "K0IV"],
  ["Azha", 2.941, -8.898, 3.89, "K1III"],
  ["Acamar", 2.971, -40.305, 2.91, "A3IV"],

  // Pegasus
  ["Algenib", 0.220, 15.184, 2.84, "B2IV"],
  ["Matar", 22.717, 30.221, 2.95, "G2II"],
  ["Biham", 22.711, 6.198, 3.53, "G8III"],

  // Andromeda
  ["Almach", 2.065, 42.330, 2.26, "K3IIb"],
  ["Mirach", 1.163, 35.621, 2.05, "M0III"],
  ["Adhil", 0.656, 33.719, 4.87, "G0V"],

  // Cepheus
  ["Alderamin", 21.310, 62.585, 2.44, "A7IV"],
  ["Alfirk", 21.478, 70.561, 3.23, "B2IIIe"],
  ["Errai", 23.656, 77.632, 3.21, "K1IV"],

  // Draco
  ["Thuban", 14.073, 64.376, 3.65, "A0III"],
  ["Rastaban", 17.507, 52.301, 2.79, "G2II"],
  ["Grumium", 17.892, 56.873, 3.75, "K5III"],
  ["Aldhibah", 17.146, 65.715, 3.17, "A1V"],

  // Bootes
  ["Nekkar", 15.032, 40.390, 3.58, "G8IIIa"],
  ["Seginus", 14.535, 38.308, 3.03, "A7III"],
  ["Muphrid", 13.912, 18.398, 2.68, "G0IV"],

  // Corona Borealis
  ["Nusakan", 15.464, 29.106, 3.68, "A9SrEuCr"],

  // Hercules
  ["Kornephoros", 16.504, 21.490, 2.77, "G7IIIa"],
  ["Zeta Herculis", 16.688, 31.603, 2.81, "F9IV"],
  ["Sarin", 17.251, 24.839, 3.14, "A3IV"],
  ["Maasym", 17.963, 29.248, 4.41, "K3IIb"],
  ["Rasalgethi", 17.244, 14.390, 2.78, "M5Ib"],

  // Lyra
  ["Sheliak", 18.835, 33.363, 3.52, "A8Ve"],
  ["Sulafat", 18.982, 32.690, 3.24, "B9III"],

  // Aquila
  ["Tarazed", 19.771, 10.613, 2.72, "K3II"],
  ["Alshain", 19.922, 6.407, 3.71, "G8IV"],
  ["Okab", 19.090, 13.863, 3.23, "A0Vn"],

  // Ophiuchus
  ["Yed Prior", 16.239, -3.694, 2.74, "M0.5III"],
  ["Yed Posterior", 16.305, -4.693, 3.24, "K2III"],
  ["Cebalrai", 17.724, 4.567, 2.77, "K2III"],
  ["Marfik", 16.619, 1.984, 3.82, "A4IV"],

  // Serpens
  ["Unukalhai", 15.737, 6.426, 2.65, "K2III"],

  // Lupus
  ["Men", 14.699, -47.388, 2.30, "B1.5III"],
  ["Kekouan", 14.986, -42.104, 2.30, "B2IV"],

  // Ara
  ["Choo", 17.531, -49.876, 2.85, "B2Vne"],

  // Corona Australis
  ["Meridiana", 19.167, -37.905, 4.10, "A2V"],

  // Pavo
  ["Peacock", 20.427, -56.735, 1.94, "B2IV"],

  // Grus
  ["Alnair", 22.137, -46.961, 1.74, "B7IV"],
  ["Tiaki", 22.711, -46.885, 2.39, "K0III"],

  // Phoenix
  ["Ankaa", 0.438, -42.306, 2.38, "K0III"],

  // Tucana
  ["Alpha Tucanae", 22.308, -60.260, 2.86, "K3III"],

  // Sculptor
  ["Alpha Sculptoris", 0.977, -29.358, 4.31, "B7IIIp"],

  // Additional bright stars for completeness
  ["Alsciaukat", 8.277, 43.188, 3.97, "K3III"],
  ["Rotanev", 20.626, 14.595, 3.63, "F5IV"],
  ["Sualocin", 20.660, 15.912, 3.77, "B9V"],
  ["Kaffaljidhma", 3.038, 4.090, 3.47, "A0Van"],
];

// Spectral class to color mapping (approximate RGB)
export const SPECTRAL_COLORS = {
  'O': [0.6, 0.7, 1.0],    // Blue
  'B': [0.7, 0.8, 1.0],    // Blue-white
  'A': [0.9, 0.9, 1.0],    // White
  'F': [1.0, 1.0, 0.9],    // Yellow-white
  'G': [1.0, 0.95, 0.8],   // Yellow
  'K': [1.0, 0.8, 0.6],    // Orange
  'M': [1.0, 0.6, 0.4],    // Red
  'W': [0.6, 0.7, 1.0],    // Wolf-Rayet (blue)
};

// Get color from spectral class
export function getStarColor(spectralClass) {
  if (!spectralClass) return [1, 1, 1];
  const type = spectralClass.charAt(0).toUpperCase();
  return SPECTRAL_COLORS[type] || [1, 1, 1];
}

// Convert magnitude to relative brightness (0-1 scale)
export function magnitudeToBrightness(magnitude) {
  // Apparent magnitude scale: brighter = lower number
  // Sirius is -1.46, faintest visible ~6
  const minMag = -1.5;
  const maxMag = 6;
  const normalized = 1 - (magnitude - minMag) / (maxMag - minMag);
  return Math.max(0.1, Math.min(1, normalized));
}

// Convert right ascension (hours) and declination (degrees) to 3D position
export function celestialToCartesian(ra, dec, distance = 1) {
  // Convert RA from hours to radians (24h = 2π)
  const raRad = (ra / 24) * 2 * Math.PI;
  // Convert Dec from degrees to radians
  const decRad = (dec / 180) * Math.PI;

  // Convert to Cartesian coordinates
  const x = distance * Math.cos(decRad) * Math.cos(raRad);
  const y = distance * Math.sin(decRad);
  const z = distance * Math.cos(decRad) * Math.sin(raRad);

  return { x, y, z };
}
