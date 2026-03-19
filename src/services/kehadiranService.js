import prisma from "../config/prisma.js";

export const addKehadiran = async ({
  siswaId,
  tahunAjaran,
  statusKehadiran,
  tanggalKehadiran,
}) => {
  // cek field
  if (!siswaId) {
    throw new Error("Siswa wajib di pilih");
  }
  if (!tahunAjaran?.trim()) {
    throw new Error("Tahun ajaran wajib di isi");
  }

  const tanggal = new Date(tanggalKehadiran);

  // karena udah pake unique jadi try catch aja
  try {
    return await prisma.kehadiran.create({
      data: {
        siswaId,
        tahunAjaran,
        statusKehadiran,
        tanggalKehadiran: tanggal,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new Error("Kehadiran di tanggal ini sudah ada");
    }
    throw error;
  }
};

export const updateKehadiran = async (
  id,
  { tahunAjaran, statusKehadiran, tanggalKehadiran },
) => {
  const existingKehadiran = await prisma.kehadiran.findUnique({
    where: { id },
  });

  if (!existingKehadiran) throw new Error("Data tidak ditemukan");

  const data = {};
  if (tahunAjaran) data.tahunAjaran = tahunAjaran;
  if (statusKehadiran) data.statusKehadiran = statusKehadiran;
  if (tanggalKehadiran) {
    data.tanggalKehadiran = new Date(tanggalKehadiran);
  }

  const updateKehadiran = await prisma.kehadiran.update({
    where: { id },
    data: data,
  });

  return updateKehadiran;
};

export const getAllKehadiran = async () => {
  const kehadirans = await prisma.kehadiran.findMany({
    select: {
      id: true,
      tahunAjaran: true,
      statusKehadiran: true,
      tanggalKehadiran: true,
      siswa: {
        select: {
          name: true,
          kelas: true,
        },
      },
    },
    orderBy: {
      tanggalKehadiran: "desc",
    },
  });

  return kehadirans;
};

export const getKehadiranRekap = async ({ siswaId, tahunAjaran, kelas }) => {
  const kehadirans = await prisma.kehadiran.findMany({
    where: {
      ...(siswaId && { siswaId }),
      ...(tahunAjaran && { tahunAjaran }),
      ...(kelas && { siswa: { kelas } }),
    },
    include: {
      siswa: {
        select: {
          name: true,
          kelas: true,
        },
      },
    },
    orderBy: {
      tanggalKehadiran: "desc",
    },
  });

  return kehadirans;
};

export const getOneKehadiran = async (id) => {
  const kehadirans = await prisma.kehadiran.findUnique({
    where: { id },
    select: {
      id: true,
      tahunAjaran: true,
      statusKehadiran: true,
      tanggalKehadiran: true,
      siswa: {
        select: {
          name: true,
          kelas: true,
        },
      },
    },
  });

  return kehadirans;
};
