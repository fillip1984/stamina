"use client";

import { Label } from "@radix-ui/react-label";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import {
  FaEllipsisVertical,
  FaEye,
  FaPencil,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";
import { GiStoneStack } from "react-icons/gi";
import { set } from "zod";
import Header, { HeaderActions } from "~/components/my-ui/header";
import LoadingAndRetry from "~/components/my-ui/loadingAndRetry";
import ScrollableContainer from "~/components/my-ui/scrollableContainer";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Input } from "~/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Spinner } from "~/components/ui/spinner";
import { Textarea } from "~/components/ui/textarea";
import { useModal } from "~/hooks/useModal";
import { api } from "~/trpc/react";
import type { AreaType } from "~/trpc/types";

export default function AreaPage() {
  const { isOpen, show, hide, showWithItem, editableItem } =
    useModal<AreaType>();

  const utils = api.useUtils();
  const {
    data: areas,
    isLoading,
    isError,
    refetch,
  } = api.area.findAll.useQuery();

  if (isLoading || isError) {
    return (
      <LoadingAndRetry
        isLoading={isLoading}
        isError={isError}
        retry={() => void refetch()}
      />
    );
  }

  return (
    <>
      <ScrollableContainer scrollToTopButton={true}>
        <Header>
          <h4>Areas</h4>
          <HeaderActions>
            <Button onClick={show} size={"icon"}>
              <FaPlus />
            </Button>
          </HeaderActions>
        </Header>

        <div className="flex w-full flex-col gap-2">
          <AnimatePresence>
            {areas?.map((area, i) => (
              <motion.div
                key={area.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  delayChildren: 0.2,
                }}
              >
                <AreaCard area={area} edit={() => showWithItem(area)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {!isLoading && areas && areas.length === 0 && (
          <EmptyView createNewAction={show} />
        )}
      </ScrollableContainer>

      {isOpen && (
        <AreaModal isOpen={isOpen} hide={hide} editableItem={editableItem} />
      )}
    </>
  );
}

const AreaCard = ({ area, edit }: { area: AreaType; edit: () => void }) => {
  const utils = api.useUtils();
  const { mutateAsync: deleteArea } = api.area.delete.useMutation({
    onSuccess: async () => {
      await utils.area.findAll.invalidate();
    },
  });

  return (
    <Item variant="outline" className="bg-card flex w-full grow">
      <ItemContent>
        <ItemTitle>{area.name}</ItemTitle>
        <ItemDescription>{area.description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        {/* <Button variant="outline" size="sm">
          Action
        </Button> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <FaEllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={edit}>
                <FaPencil />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem>
                <FaEye />
                View Activity
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => deleteArea(area.id)}
              >
                <FaTrash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );
};

const AreaModal = ({
  isOpen,
  hide,
  editableItem,
}: {
  isOpen: boolean;
  hide: () => void;
  editableItem: AreaType | null;
}) => {
  const [mode, setMode] = useState<"Create" | "Update">("Create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // IX: init form state
  useEffect(() => {
    if (editableItem) {
      setName(editableItem.name);
      setDescription(editableItem.description);
      setMode("Update");
    } else {
      setName("");
      setDescription("");
      setMode("Create");
    }
  }, [editableItem]);

  // UX: form validation
  const [isValid, setIsValid] = useState(false);
  const validateForm = () => {
    if (name.trim() === "") return false;
    if (description.trim() === "") return false;
    return true;
  };
  useEffect(() => {
    setIsValid(validateForm());
  }, [name, description]);

  // MX: create/update area
  const utils = api.useUtils();
  const { mutateAsync: createArea, isPending: isCreating } =
    api.area.create.useMutation({
      onSuccess: async () => {
        await utils.area.findAll.invalidate();
        hide();
      },
    });
  const { mutateAsync: updateArea, isPending: isUpdating } =
    api.area.update.useMutation({
      onSuccess: async () => {
        await utils.area.findAll.invalidate();
        hide();
      },
    });

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!isValid) return;

    if (editableItem && mode === "Update") {
      await updateArea({
        ...editableItem,
        name: name.trim(),
        description: description.trim(),
      });
    } else {
      await createArea({ name: name.trim(), description: description.trim() });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && hide()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode} area</DialogTitle>
          <DialogDescription>
            {mode} area, areas are used to categorize your items.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Area name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Area description"
            />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"outline"} onClick={hide}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => handleSubmit()}
            disabled={!isValid || isCreating || isUpdating}
          >
            {isCreating || isUpdating ? <Spinner /> : mode}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EmptyView = ({ createNewAction }: { createNewAction: () => void }) => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <GiStoneStack />
        </EmptyMedia>
        <EmptyTitle>Nothing to show yet</EmptyTitle>
        <EmptyDescription>
          Try clicking some of the buttons to get started...
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={createNewAction}>Create</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
};
