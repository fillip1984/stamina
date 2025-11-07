import Header from "~/components/my-ui/header";
import ScrollableContainer from "~/components/my-ui/scrollableContainer";

export default function AreaPage() {
  return (
    <ScrollableContainer scrollToTopButton={true}>
      <Header>
        <h4>Areas</h4>
      </Header>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="rounded border p-2">
            Area {index + 1} Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Delectus quidem necessitatibus quis saepe magni quia aliquid
            consequatur voluptatibus molestias nam velit, aut fugiat tempore
            dicta voluptate reiciendis quod laborum nemo similique. Cupiditate
            ipsum excepturi nihil? Aspernatur necessitatibus dolore provident
            blanditiis nesciunt, et quidem eius esse laborum deleniti, nam sed
            ducimus.
          </div>
        ))}
      </div>
    </ScrollableContainer>
  );
}
