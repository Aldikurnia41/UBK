import { forbidden, redirect } from 'next/navigation'
import { default as Link } from 'next/link'
import { default as Image } from 'next/image'
import { Fragment } from 'react/jsx-runtime'
import {
  SidebarLayout,
  SidebarGroup,
  SidebarSeparator,
  SidebarMenuButton,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  Icon,
} from '@sisfo-remake/ui'
import { PureAbility } from '@casl/ability'
import { cn } from '@/lib/utils'
import { getPermissionAbility } from '@/lib/helpers'
import { auth } from '@/lib/auth'
import { getAllNotification } from '@/feat/notification/api'
import { getAvatarFallbackInitials } from '@/feat/auth/helpers'
import { NotificationDropdown } from '@/feat/auth/components/notification-dropdown'
import { AccountDropdown } from '@/feat/auth/components/account-dropdown'
import { Config, Routes, SSOConfig } from '@/config'

export default async function DefaultHomepageLayout({ children }: React.PropsWithChildren) {
  const session = await auth()
  const ability = new PureAbility(session?.permissions)
  const canReadNotif = ability.can('lihat', 'notifikasi_sendiri')
  const canManageNotif = ability.can('mengelola', 'notifikasi_sendiri')
  const socketUrl = process.env.APP_URL_SOCKET ?? ''
  const socketPath = process.env.APP_URL_SOCKET_PATH ?? ''

  if (session?.roles?.length === 0) {
    forbidden()
  }

  // NextAuth can resolve `auth()` to a truthy error-shaped object (e.g. when
  // the Keycloak provider config is invalid) instead of `null`, so a plain
  // `!session` check isn't enough — also guard on the fields we actually use.
  if (!session?.profile) {
    return redirect(Routes.Login)
  }

  const { dashboard, schedule, question, assessment, formtype, access, role, worktest } =
    await getPermissionAbility()
  const { data: notifications } = await getAllNotification()

  return (
    <SidebarLayout
      logo={
        <div className='group-data-[state=collapsed]:mt-14'>
          <Link
            href={Routes.Dashboard}
            tabIndex={-1}
            className='focus-visible:outline-ring/20 flex flex-col rounded-lg text-left outline-offset-8 focus-visible:outline-[3px]'
          >
            <Image
              src='/logo-belneg.png'
              alt='Logo Pusdiklat Bela Negara'
              width={88}
              height={88}
              className='size-11 origin-center group-data-[state=collapsed]:hidden'
            />
            <span
              aria-hidden
              className='mt-4 flex flex-col gap-1 group-data-[state=collapsed]:hidden'
            >
              <span className='text-lg leading-7 font-semibold'>{Config.Title}</span>
              <span className='text-xs leading-4.5'>{Config.Subtitle}</span>
            </span>
            <span className='sr-only'>
              {Config.Title} - {Config.Subtitle}
            </span>
          </Link>
          {canReadNotif && (
            <NotificationDropdown
              notifications={notifications}
              socketUrl={socketUrl}
              socketPath={socketPath}
              token={session.access_token}
              author={session.profile.fullName}
              canManageNotif={canManageNotif}
              instituteSelected={SSOConfig.InstituteSelected}
            />
          )}
        </div>
      }
      props={{
        sidebarList: { buttonClasses: cn('gap-3') },
        sidebarHeaderGroup: {
          className: cn('relative flex-row p-5 justify-center'),
        },
        sidebarContentGroup: {
          className: cn('p-5 overflow-y-auto'),
        },
        sidebarProvider: {
          style: {
            '--sidebar-width-icon': '5.3125rem',
          } as React.CSSProperties,
        },
        sidebarFooter: {
          children: (
            <Fragment>
              <SidebarSeparator />
              <SidebarGroup className='p-0 group-data-[collapsible=icon]:p-5'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className='h-fit gap-3 px-8 pt-4 pb-5 group-data-[collapsible=icon]:p-1.25'>
                      <Avatar className='size-8.75'>
                        <AvatarFallback className='bg-primary-2 text-lg font-bold text-white uppercase'>
                          {getAvatarFallbackInitials(session?.profile.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1 truncate [&>div]:truncate'>
                        <div className='leading-5 font-medium'>{session.profile.fullName}</div>
                        <div className='text-sm leading-5.25'>{session.roles[0].name}</div>
                      </div>
                      <Icon type='Ikon Meatballs Default' className='text-primary-2 size-4!' />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <AccountDropdown />
                </DropdownMenu>
              </SidebarGroup>
            </Fragment>
          ),
          className: 'gap-0',
        },
        trigger: {
          menuIcon: <Icon type='Ikon Hamburger' />,
          className: cn(
            'bg-primary size-7 rounded-sm hover:bg-primary/80 hover:text-primary-foreground text-primary-foreground absolute top-7 right-5 shadow-xl group-data-[state=collapsed]:right-7'
          ),
        },
        triggerMobile: {
          menuIcon: <Icon type='Ikon Hamburger' />,
          className: cn(
            'bg-primary size-7 rounded-sm hover:bg-primary/80 hover:text-primary-foreground text-primary-foreground shadow-xl'
          ),
        },
        triggerMobileContainer: { className: cn('p-5') },
      }}
      items={[
        {
          title: (
            <Fragment>
              <p className='mb-1 font-bold uppercase group-data-[state=collapsed]:hidden'>Menu</p>
            </Fragment>
          ),
          menus: [
            {
              path: Routes.Dashboard,
              aliases: 'Dashboard',
              icon: <Icon type='Ikon Beranda' />,
              hide: !dashboard.canRead,
            },
            {
              path: Routes.Calendar,
              aliases: 'Kalender',
              icon: <Icon type='Ikon Kalender' size={16} />,
            },
            {
              path: Routes.QuestionBank,
              aliases: 'Bank Soal',
              icon: <Icon type='Ikon Bank Soal' />,
              child: [
                {
                  path: Routes.QuestionType,
                  aliases: 'Bentuk Soal',
                  hide: !formtype.canManage,
                },
                {
                  path: Routes.PretestQuestion,
                  aliases: 'Soal Pretest',
                  hide: !question.canManage,
                },
                {
                  path: Routes.PosttestQuestion,
                  aliases: 'Soal Posttest',
                  hide: !question.canManage,
                },
                {
                  path: Routes.QuizQuestion,
                  aliases: 'Soal Kuis',
                  hide: !question.canManage,
                },
              ],
              hide: !formtype.canManage && !question.canManage,
            },
            {
              path: Routes.TestSchedule,
              aliases: 'Jadwal Tes',
              icon: <Icon type='Ikon Jadwal Ujian Masuk' />,
              hide: !schedule.canManage,
            },
            {
              path: Routes.Assessment,
              aliases: 'Penilaian',
              icon: <Icon type='Ikon Penilaian' />,
              hide: !assessment.canManage,
            },
            {
              path: Routes.Result,
              aliases: 'Hasil',
              icon: <Icon type='Ikon Hasil Evaluasi' />,
              hide: !assessment.canManage,
            },
            {
              // Jadwal Tes versi siswa (Kerjakan Tes + token)
              path: Routes.Test,
              aliases: 'Jadwal Tes',
              icon: <Icon type='Ikon Jadwal Ujian Masuk' />,
              exact: true,
              hide: !worktest.canWorking || schedule.canManage,
            },
            {
              path: Routes.Management,
              aliases: 'Manajemen Akun',
              icon: <Icon type='Ikon Manajemen Internal' size={16} />,
              child: [
                {
                  path: Routes.Roles,
                  aliases: 'Peran & Izin',
                  exact: true,
                  hide: !role.canRead,
                },
                {
                  path: Routes.Access,
                  aliases: 'Akses',
                  exact: true,
                  hide: !access.canRead,
                },
              ],
              hide: !access.canRead && !role.canRead,
            },
          ],
        },
      ]}
    >
      {children}
    </SidebarLayout>
  )
}
