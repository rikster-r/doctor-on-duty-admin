import UsersDashboard from '@/components/UsersDashboard';
import { GetServerSidePropsContext } from 'next';

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const authToken = context.req.cookies.authToken;

  if (!authToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};

function Users() {
  return <UsersDashboard />;
}

export default Users;
