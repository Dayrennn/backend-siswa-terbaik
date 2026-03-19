import prisma from "../config/prisma.js";

// tambah siswa
export const addSiswa = async ({ nis, name, tanggalLahir, kelas }) => {
  const existingSiswa = await prisma.siswa.findFirst({
    where: {
      OR: [{ nis }, { name }],
    },
  });

  if (existingSiswa) throw new Error("Data siswa sudah ada");

  // ambil semua pelajaran dan kriteria otomatis
  const allPelajaran = await prisma.pelajaran.findMany();
  const allKriteria = await prisma.kriteria.findMany();
  const allKehadiran = await prisma.kehadiran.findMany();

  const newSiswa = await prisma.siswa.create({
    data: {
      nis: nis,
      name: name,
      tanggalLahir: new Date(tanggalLahir),
      kelas: kelas,
      // isi nilai otomatis, default 0
      nilai: {
        create: allPelajaran.map((pelajaran) => ({
          pelajaranId: pelajaran.id,
          nilai: 0,
        })),
      },
      nilaiKriteria: {
        create: allKriteria.map((kriteria) => ({
          kriteriaId: kriteria.id,
          nilai: 0,
        })),
      },
      kehadiran: {
        create: allKehadiran.map((kehadiran) => ({
          kehadiranId: kehadiran.id,
          statusKehadiran: "Alpha",
        })),
      },
    },
  });

  return newSiswa;
};

// update siswa
export const updateSiswa = async (
  id,
  { nis, name, tanggalLahir, kelas, nilai, nilaiKriteria },
) => {
  const existingSiswa = await prisma.siswa.findUnique({
    where: { id },
  });

  if (!existingSiswa) throw new Error("Siswa tidak ditemukan");

  if (nis || name) {
    const existing = await prisma.siswa.findFirst({
      where: {
        OR: [nis ? { nis } : undefined, name ? { name } : undefined].filter(
          Boolean,
        ),
        NOT: { id },
      },
    });
    if (existing) throw new Error("nis dan nama sudah digunakan");
  }

  const data = {};
  if (nis) data.nis = nis;
  if (name) data.name = name;
  if (tanggalLahir) data.tanggalLahir = new Date(tanggalLahir);
  if (kelas) data.kelas = kelas;

  // Update nilai jika dikirim
  if (nilai) {
    data.nilai = {
      upsert: nilai.map((n) => ({
        where: {
          siswaId_pelajaranId: {
            siswaId: id,
            pelajaranId: n.pelajaranId,
          },
        },
        update: { nilai: n.nilai },
        create: { nilai: n.nilai, pelajaranId: n.pelajaranId },
      })),
    };
  }

  if (nilaiKriteria) {
    data.nilaiKriteria = {
      upsert: nilaiKriteria.map((n) => ({
        where: {
          siswaId_kriteriaId: {
            siswaId: id,
            kriteriaId: n.kriteriaId,
          },
        },
        update: { nilai: n.nilai },
        create: { nilai: n.nilai, kriteriaId: n.kriteriaId },
      })),
    };
  }

  const updateSiswa = await prisma.siswa.update({
    where: { id },
    data,
    include: {
      nilai: {
        include: {
          pelajaran: true,
        },
      },
      nilaiKriteria: {
        include: {
          kriteria: true,
        },
      },
    },
  });
  return updateSiswa;
};

export const getAllSiswa = async () => {
  const siswas = await prisma.siswa.findMany({
    include: {
      nilai: {
        include: {
          pelajaran: true,
        },
      },
      nilaiKriteria: {
        include: {
          kriteria: true,
        },
      },
    },
  });

  return siswas;
};

export const getOneSiswa = async (id) => {
  const siswas = await prisma.siswa.findUnique({
    where: { id },
    include: {
      nilai: {
        include: {
          pelajaran: true,
        },
      },
      nilaiKriteria: {
        include: {
          kriteria: true,
        },
      },
    },
  });

  return siswas;
};
