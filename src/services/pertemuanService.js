import prisma from "../config/prisma.js";

export const addPertemuan = async ({
  tahunAjaranId,
  tanggal,
  kelasId,
  namaPertemuan,
}) => {
  if (!tahunAjaranId) {
    throw new Error("Tahun Ajaran Wajib Di Pilih");
  }
  if (!namaPertemuan) {
    throw new Error("Nama Pertemuan Wajib Di Isi");
  }
  if (!tanggal) {
    throw new Error("Tanggal Wajib Di Isi");
  }
  if (!kelasId) {
    throw new Error("Wajib Pilih Kelas");
  }

  const existingPertemuan = await prisma.pertemuan.findFirst({
    where: {
      namaPertemuan,
      tahunAjaranId,
      kelasId,
    },
  });

  if (existingPertemuan) {
    throw new Error("Nama Pertemuan Sudah Ada");
  }

  const newPertemuan = await prisma.pertemuan.create({
    data: {
      tahunAjaranId: tahunAjaranId,
      tanggal: tanggal,
      kelasId: kelasId,
      namaPertemuan: namaPertemuan,
    },
  });

  return newPertemuan;
};
