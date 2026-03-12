import prisma from "../config/prisma.js";

// tambah siswa
export const addSiswa = async ({ nis, name, tanggalLahir, kelas, nilai }) => {
  const existingSiswa = await prisma.siswa.findFirst({
    where: {
      OR: [{ nis }, { name }],
    },
  });

  if (existingSiswa) throw new Error("Data siswa sudah ada");

  const newSiswa = await prisma.siswa.create({
    data: {
      nis: nis,
      name: name,
      tanggalLahir: new Date(tanggalLahir),
      kelas: kelas,
      // isi sekaligus saat tambah siswa
      nilai: {
        create: nilai?.map((n) => ({
          nilai: n.nilai,
          mataPelajaranId: n.mataPelajaranId,
        })),
      },
    },
  });

  return newSiswa;
};

// update siswa
export const updateSiswa = async (
  id,
  { nis, name, tanggalLahir, kelas, nilai },
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
  if (tanggalLahir) data.tanggalLahir = tanggalLahir;
  if (kelas) data.kelas = kelas;
  if (nilai) data.nilai = nilai;

  // Update nilai jika dikirim
  if (nilai) {
    data.nilai = {
      upsert: nilai.map((n) => ({
        where: {
          siswaId_mataPelajaranId: {
            siswaId: id,
            mataPelajaranId: n.mataPelajaranId,
          },
        },
        update: { nilai: n.nilai },
        create: { nilai: n.nilai, mataPelajaranId: n.mataPelajaranId },
      })),
    };
  }

  const updateSiswa = await prisma.siswa.update({
    where: { id },
    data,
    include: {
      nilai: {
        include: { mataPelajaran: true },
      },
    },
  });
  return updateSiswa;
};
