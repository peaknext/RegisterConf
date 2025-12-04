import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Users, Building2, Shield } from "lucide-react";

async function getMembers() {
  return prisma.member.findMany({
    include: {
      hospital: true,
      _count: {
        select: { attendees: true },
      },
    },
    orderBy: { id: "asc" },
  });
}

export default async function MembersPage() {
  const members = await getMembers();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสมาชิก</h1>
          <p className="text-gray-500">รายการตัวแทนโรงพยาบาล</p>
        </div>
        <Link href="/admin/members/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสมาชิก
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{members.length}</p>
                <p className="text-sm text-gray-500">สมาชิกทั้งหมด</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {members.filter((m) => m.hospital).length}
                </p>
                <p className="text-sm text-gray-500">มีโรงพยาบาล</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {members.filter((m) => m.memberType === 99).length}
                </p>
                <p className="text-sm text-gray-500">Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสมาชิก</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-gray-500">ID</th>
                  <th className="pb-3 font-medium text-gray-500">อีเมล</th>
                  <th className="pb-3 font-medium text-gray-500">โรงพยาบาล</th>
                  <th className="pb-3 font-medium text-gray-500">ประเภท</th>
                  <th className="pb-3 font-medium text-gray-500">ผู้ลงทะเบียน</th>
                  <th className="pb-3 font-medium text-gray-500">วันที่สร้าง</th>
                  <th className="pb-3 font-medium text-gray-500 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="py-3">{member.id}</td>
                    <td className="py-3">{member.email}</td>
                    <td className="py-3">
                      {member.hospital?.name || (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {member.memberType === 99 ? (
                        <Badge className="bg-purple-100 text-purple-700">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </td>
                    <td className="py-3">{member._count.attendees} คน</td>
                    <td className="py-3 text-sm text-gray-500">
                      {formatDate(member.createdAt)}
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <Link href={`/admin/members/${member.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
