import prisma from "../config/prisma.js";

export const addKriteria = async ({ namaKriteria, bobot, jenis }) => {
  // cek field
  if (!namaKriteria?.trim() || !jenis?.trim()) {
    throw new Error("Data wajib di isi");
  }

  if (bobot === undefined || bobot === null) {
    throw new Error("Bobot wajib di isi");
  }

  const existingKriteria = await prisma.kriteria.findFirst({
    where: {
      OR: [{ namaKriteria }],
    },
  });

  if (existingKriteria) throw new Error("Data sudah ada");

  const newKriteria = await prisma.kriteria.create({
    data: {
      namaKriteria: namaKriteria,
      bobot: bobot,
      jenis: jenis,
    },
  });

  return newKriteria;
};

export const updateKriteria = async (id, { namaKriteria, bobot, jenis }) => {
  const existingKriteria = await prisma.kriteria.findUnique({
    where: { id },
  });

  if (!existingKriteria) throw new Error("Kriteria tidak ditemukan");

  if (namaKriteria) {
    const existing = await prisma.kriteria.findFirst({
      where: {
        namaKriteria,
        NOT: { id },
      },
    });
    if (existing) throw new Error("nama kriteria sudah digunakan");
  }

  const data = {};
  if (namaKriteria) data.namaKriteria = namaKriteria;
  if (bobot) data.bobot = bobot;
  if (jenis) data.jenis = jenis;

  const updateKriteria = await prisma.kriteria.update({
    where: { id },
    data: data,
  });

  return updateKriteria;
};

export const getKriteria = async () => {
  const kriterias = await prisma.kriteria.findMany({
    select: {
      id: true,
      namaKriteria: true,
      bobot: true,
      jenis: true,
    },
  });
  return kriterias;
};

export const getOneKriteria = async (id) => {
  const kriterias = await prisma.kriteria.findUnique({
    where: { id },
    select: {
      id: true,
      namaKriteria: true,
      bobot: true,
      jenis: true,
    },
  });
  return kriterias;
};
