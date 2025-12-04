import { lazy, Suspense, useMemo } from 'react'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider, useNavigate, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LanguageRoute from './components/LanguageRoute/LanguageRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import ConfirmEmail from './pages/Auth/ConfirmEmail'
import ForgotPasswordEmail from './pages/Auth/ForgotPasswordEmail'
import ForgotPasswordReset from './pages/Auth/ForgotPasswordReset'
import DashboardLayout from './pages/Dashboard.Layout'
import Files from './pages/Files/AllFiles/Files'
import UploadFiles from './pages/Files/fileDetails/fileDetails'
import LoginProtector from './protectors/LoginProtector'
import Profile from './pages/profile/Profile'
import RoleProtector from './protectors/RoleProtector'
import Users from './pages/OwnerPages/Users/Users'
import Analasys from './pages/OwnerPages/Analasyis/Analasys'
import Payments from './pages/OwnerPages/Payments/Payments'
import Subscriptions from './pages/OwnerPages/Subscriptions/Subscriptions'
import Storage from './pages/OwnerPages/Storage/Storage'
import DownloadsViews from './pages/OwnerPages/DownloadsViews/DownloadsViews'
import Withdrawals from './pages/OwnerPages/Withdrawals/Withdrawals'
import { useCookies } from 'react-cookie'
import { jwtDecode } from 'jwt-decode'
import LandingLayout from './pages/LandingLayout'

import VideoPreview from './pages/VideoPreview/VideoPreview'
import Earning from './pages/Earning/Earning'
import Promoters from './pages/OwnerPages/Promoters/Promoters'
import PromotersEarning from './pages/Earning/PromotersEarning'
import Notifications from './pages/Notifications/Notifications'
import PromoterDashboard from './pages/Promoter/PromoterDashboard'
import SharedFiles from './pages/SharedFiles/SharedFiles'
import RevenueData from './pages/RevenueData/RevenueData'
import Referral from './pages/Referral/Referral'
import PromoterProtector from './protectors/PromoterProtector'
import PromoterWithPlanProtector from './protectors/PromoterWithPlanProtector'
import Channels from './pages/Channels/Channels'
import ChannelFiles from './pages/Channels/ChannelFiles'
import PromoterChannels from './pages/Channels/PromoterChannels'
import SubscriptionPlans from './pages/SubscriptionPlans/SubscriptionPlans'


// Main Pages
const Feedback = lazy(() => import('./pages/Feedback/Feedback'))
const PrivacyPolicy = lazy(() => import('./pages/Privacy/Privacy'))
const RemovalGuidelines = lazy(() => import('./pages/RemovalPolicy/RemovalPolicy'))
const Partners = lazy(() => import('./pages/Partners/Partners'))
const PromotersLanding = lazy(() => import('./pages/Promoters/Promoters'))
const Subscription = lazy(() => import('./pages/Subscription/Subscription'))
const Contact = lazy(() => import('./pages/Contact/Contact'))
const TermsOfService = lazy(() => import('./pages/TermsOfService/TermsOfService'))
const RewardsEligibility = lazy(() => import('./pages/RewardsEligibility/RewardsEligibility'))

import Loading from './components/Loading/Loading'
import SignupForMoney from './pages/Auth/SignupForMoney'
import Reports from './pages/OwnerPages/Reports/Reports'


const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [Token] = useCookies(['MegaBox']);


  return children({ navigate, auth, Token });
};

const AppRouter = () => {
  const router = useMemo(() => createBrowserRouter([
    {
      path: "/",
      element: (
        <LanguageRoute>
          <LandingLayout />
        </LanguageRoute>
      ),
      children: [
        {
          index: true, element: <LandingPage />
        },
        {
          path: "Partners", element:
            <Suspense fallback={<Loading />}><Partners /></Suspense>
        },
        {
          path: "Privacy", element: <Suspense fallback={<Loading />}> <PrivacyPolicy /></Suspense>
        },
        {
          path: "Privacy-Removal", element: <Suspense fallback={<Loading />}>
            <RemovalGuidelines />
          </Suspense>
        },
        {
          path: "copyright-feedback", element: <Suspense fallback={<Loading />}> <Feedback /></Suspense>
        },
        {
          path: "contact-support", element: <Suspense fallback={<Loading />}> <Contact /></Suspense>
        },
        {
          path: "terms-of-service", element: <Suspense fallback={<Loading />}> <TermsOfService /></Suspense>
        },
        {
          path: "rewards-eligibility", element: <Suspense fallback={<Loading />}> <RewardsEligibility /></Suspense>
        },
        {
          path: "Promoters", element: <Suspense fallback={<Loading />}> <PromotersLanding /></Suspense>
        }
      ]
    },
    {
      path: "/share/:VideoId", element: <VideoPreview />
    },
    {
      path: "/login",
      element: (
        <AuthWrapper>
          {({ navigate, auth, Token }) => (
            <Login
              onSignup={() => navigate('/signup')}
              onForgot={() => navigate('/forgot-password')}

              onSubmit={async (values) => {
                let success = await auth.login(values.email, values.password)

                const tokenStr = Token.MegaBox;
                console.log(tokenStr);


                if (success) {
                  const { role } = jwtDecode(success);
                  console.log(role);
                  switch (role) {
                    case 'User':
                      navigate('/dashboard');
                      break;
                    case 'Owner':
                      navigate('/Owner/profile');
                      break;
                    default:
                      navigate('/dashboard');
                  }
                }

              }}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/signup",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <Signup
              onLogin={() => navigate('/login')}
              onConfirmMail={async (values) => {
                const success = await auth.signup(
                  values.username,
                  values.email,
                  values.password,
                  values.confirmationPassword
                );
                if (success) {
                  navigate('/confirm-email');
                }
              }}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/register",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => {
            const location = window.location;
            const params = new URLSearchParams(location.search);
            const ref = params.get("ref");

            return (
              <SignupForMoney
                refCode={ref}
                onLogin={() => navigate('/login')}
                onConfirmMail={async (values) => {
                  const success = await auth.signupWithRef(
                    values.username,
                    values.email,
                    values.password,
                    values.confirmationPassword,
                    ref
                  );
                  console.log(success);

                  if (success) {
                    navigate('/confirm-email');
                  }
                }}
                loading={auth.loading}
                error={auth.error}
              />
            );
          }}
        </AuthWrapper>
      )
    },
    {
      path: "/confirm-email",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <ConfirmEmail
              email={auth.tempEmail}
              onConfirm={async (code) => {
                const success = await auth.confirmOTP(code, auth.tempEmail);
                if (success) {
                  navigate('/login');
                }
              }}
              onResend={async () => {
                await auth.sendResetCode(auth.tempEmail);
              }}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/forgot-password",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <ForgotPasswordEmail
              onSendCode={async (email) => {
                const success = await auth.forgotPassword(email);
                if (success) {
                  navigate('/reset-password');
                }
              }}
              onBackToLogin={() => navigate('/login')}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },
    {
      path: "/reset-password",
      element: (
        <AuthWrapper>
          {({ navigate, auth }) => (
            <ForgotPasswordReset
              onReset={async (values) => {
                const success = await auth.resetPassword(
                  values.email,
                  values.password,
                  values.code
                );
                if (success) {
                  navigate('/login');
                }
              }}
              onBackToLogin={() => navigate('/login')}
              loading={auth.loading}
              error={auth.error}
            />
          )}
        </AuthWrapper>
      )
    },

    // User dash /////////////////////////////
    {
      path: "/dashboard", element: <LoginProtector><DashboardLayout role={"User"} /> </LoginProtector>, children: [
        {
          index: true,
          element: <Navigate to="/dashboard/files" replace />
        },
        {
          path: "files", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Files />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "file/:fileName/:fileId", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <UploadFiles />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "profile", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Profile />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "notifications", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Notifications />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "subscription-plans", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Suspense fallback={<Loading />}>
                  <SubscriptionPlans />
                </Suspense>
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "channels", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <Channels />
              </RoleProtector>
            </LoginProtector>
        },
        {
          path: "channels/:channelId/files", element:
            <LoginProtector>
              <RoleProtector requiredRole="User">
                <ChannelFiles />
              </RoleProtector>
            </LoginProtector>
        }
      ]
    },
    // User dash

    // Promoter /////////////////////////////
    {
      path: "/Promoter", element: <LoginProtector><DashboardLayout role={"User"} /> </LoginProtector>, children: [
        {
          index: true, element:
            <LoginProtector>
              <PromoterProtector>
                <PromoterDashboard />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "notifications", element:
            <LoginProtector>
              <PromoterProtector>
                <Notifications />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "profile", element:
            <LoginProtector>
              <PromoterProtector>
                <Profile />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "files", element:
            <LoginProtector>
              <PromoterProtector>
                <Files />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "file/:fileName/:fileId", element:
            <LoginProtector>
              <PromoterProtector>
                <UploadFiles />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "channels", element:
            <LoginProtector>
              <PromoterProtector>
                <PromoterChannels />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "channels/:channelId/files", element:
            <LoginProtector>
              <PromoterProtector>
                <ChannelFiles />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "subscription-plans", element:
            <LoginProtector>
              <PromoterProtector>
                <SubscriptionPlans />
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "revenue-data", element:
            <LoginProtector>
              <PromoterProtector>
                <PromoterWithPlanProtector>
                  <RevenueData />
                </PromoterWithPlanProtector>
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "shared-files", element:
            <LoginProtector>
              <PromoterProtector>
                <PromoterWithPlanProtector>
                  <SharedFiles />
                </PromoterWithPlanProtector>
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "Earnings", element:
            <LoginProtector>
              <PromoterProtector>
                <PromoterWithPlanProtector>
                  <Earning />
                </PromoterWithPlanProtector>
              </PromoterProtector>
            </LoginProtector>
        },
        {
          path: "referral", element:
            <LoginProtector>
              <PromoterProtector>
                <Referral />
              </PromoterProtector>
            </LoginProtector>
        }
      ]
    },
    // Promoter 

    // Owner ////////////////////////////
    {
      path: "/Owner", element: <LoginProtector><DashboardLayout role={"Owner"} /> </LoginProtector>, children: [
        {
          index: true, element:
            <LoginProtector>
              <RoleProtector requiredRole="Owner">
                <Analasys />
              </RoleProtector >
            </LoginProtector>
        },
        {
          path: "Users", element:
            <RoleProtector requiredRole="Owner">
              <LoginProtector>
                <Users />
              </LoginProtector>
            </RoleProtector>
        },
        {
          path: "profile", element:
            <LoginProtector>
              <RoleProtector requiredRole="Owner">
                <Profile />
              </RoleProtector>
            </LoginProtector>
        }, {
          path: "AllPromoters", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Promoters />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Promoter/:id", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <PromotersEarning />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Reports", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Reports />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Payments", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Payments />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Subscriptions", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Subscriptions />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Storage", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Storage />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "DownloadsViews", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <DownloadsViews />
            </RoleProtector>
          </LoginProtector>
        }, {
          path: "Withdrawals", element: <LoginProtector>
            <RoleProtector requiredRole="Owner">
              <Withdrawals />
            </RoleProtector>
          </LoginProtector>
        }
      ]
    }
    // Owner 

  ]), []);

  return <RouterProvider router={router} />;
};

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App
